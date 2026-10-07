/** Validação isolada: Node + PGlite externo, sem conexão ao Supabase ou dados reais. */
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

if (!process.argv[2]) throw new Error('Informe o caminho de @electric-sql/pglite/dist/index.js.');
const { PGlite } = await import(pathToFileURL(resolve(process.argv[2])).href);
const db = new PGlite();
const uuid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const owner = uuid(1),
  requester = uuid(2),
  outsider = uuid(3);
const book = uuid(10),
  original = uuid(11),
  counter = uuid(12),
  alien = uuid(13),
  sale = uuid(14);
const request = uuid(20),
  competing = uuid(21);
let checks = 0;
const query = (sql, params = []) => db.query(sql, params);
async function as(user) {
  await db.exec('reset role');
  await query("select set_config('request.jwt.claim.sub', $1, false)", [user ?? '']);
  await db.exec('set role authenticated');
}
async function rejects(sql, params, code) {
  await assert.rejects(query(sql, params), (error) => error.code === code);
  checks++;
}
async function state() {
  return (
    await query(
      'select status, offered_listing_id, counter_listing_id from public.book_requests where id = $1',
      [request],
    )
  ).rows[0];
}
async function reset() {
  await db.exec('reset role; truncate public.book_requests cascade;');
  await db.exec("update public.listings set status = 'disponivel'");
  await query(
    `insert into public.book_requests (id, listing_id, requester_id, offered_listing_id, public_location, meeting_date, meeting_time)
    values ($1, $2, $3, $4, 'Biblioteca', '2026-10-10', '10:00'),
    ($5, $2, $6, null, 'Biblioteca', '2026-10-10', '11:00')`,
    [request, book, requester, original, competing, outsider],
  );
  await as(owner);
}
try {
  // Apenas os serviços gerenciados são simulados; tabelas, funções e RLS do produto
  // vêm integralmente das migrações necessárias à contraproposta, na ordem real.
  // --todas também diagnostica migrações independentes desta funcionalidade.
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth; create schema storage;
    create table auth.users (id uuid primary key, raw_user_meta_data jsonb default '{}', created_at timestamptz default now(), deleted_at timestamptz);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create table storage.buckets (id text primary key, name text, public boolean);
    create table storage.objects (id uuid primary key, bucket_id text, name text);
    create function storage.foldername(text) returns text[] language sql immutable as $$ select string_to_array($1, '/') $$;
    grant usage on schema public, auth, storage to authenticated, anon;
    grant execute on function auth.uid() to authenticated, anon;
  `);
  const migrations = new URL('../supabase/migrations/', import.meta.url);
  const dependencies = new Set([
    '20260930120000_catalogo_anuncios.sql',
    '20261002120000_notificacoes.sql',
    '20261002125000_book_requests.sql',
    '20261002130000_seguranca_denuncias_bloqueios.sql',
    '20261002140000_negociacao_transicoes.sql',
    '20261003130000_negociacao_completa.sql',
    '20261007130000_contraproposta.sql',
  ]);
  const all = process.argv.includes('--todas');
  for (const name of (await readdir(migrations))
    .filter((name) => name.endsWith('.sql') && (all || dependencies.has(name)))
    .sort()) {
    try {
      await db.exec(await readFile(new URL(name, migrations), 'utf8'));
    } catch (error) {
      throw new Error(`Migração ${name}: ${error.code} — ${error.message}`);
    }
  }
  await db.exec(
    'grant select, insert, update, delete on all tables in schema public to authenticated',
  );
  for (const id of [owner, requester, outsider])
    await query('insert into auth.users(id) values ($1)', [id]);
  for (const [id, user, modality] of [
    [book, owner, 'trade'],
    [original, requester, 'trade'],
    [counter, requester, 'trade'],
    [alien, outsider, 'trade'],
    [sale, requester, 'sale'],
  ]) {
    await query(
      `insert into public.listings(id, owner_id, title, author, category, modality, condition, trade_terms, price_cents)
      values ($1, $2, 'Livro de teste', 'Autor de teste', 'Literatura brasileira', $3, 'bom', $4, $5)`,
      [
        id,
        user,
        modality,
        modality === 'trade' ? 'Romances' : null,
        modality === 'sale' ? 1000 : null,
      ],
    );
  }
  await reset();
  assert.deepEqual(
    (await query('select id from public.shelf_of_requester($1)', [request])).rows.map(
      (row) => row.id,
    ),
    [counter],
  );
  checks++;
  await as(outsider);
  await rejects('select public.counter_offer($1, $2)', [request, counter], '42501');
  assert.equal(
    (await query('select * from public.shelf_of_requester($1)', [request])).rows.length,
    0,
  );
  checks++;
  await as(owner);
  for (const invalid of [original, alien, sale, book])
    await rejects('select public.counter_offer($1, $2)', [request, invalid], 'P0001');
  await query('select public.counter_offer($1, $2)', [request, counter]);
  assert.equal((await state()).counter_listing_id, counter);
  checks++;
  await rejects('select public.counter_offer($1, $2)', [request, counter], 'P0001');
  await rejects("select * from public.transition_book_request($1, 'accepted')", [request], 'P0001');
  await rejects('select public.answer_counter_offer($1, true)', [request], '42501');
  await query("update public.book_requests set status = 'accepted' where id = $1", [request]);
  assert.equal((await state()).status, 'pending');
  checks++;
  await as(requester);
  await rejects('select public.answer_counter_offer($1, null)', [request], 'P0001');
  await query('select public.answer_counter_offer($1, true)', [request]);
  assert.deepEqual(await state(), {
    status: 'accepted',
    offered_listing_id: counter,
    counter_listing_id: null,
  });
  checks++;
  await db.exec('reset role');
  const states = Object.fromEntries(
    (await query('select id, status from public.listings')).rows.map((row) => [row.id, row.status]),
  );
  assert.equal(states[book], 'reservado');
  assert.equal(states[counter], 'reservado');
  assert.equal(states[original], 'disponivel');
  checks++;
  assert.equal(
    (await query('select status from public.book_requests where id = $1', [competing])).rows[0]
      .status,
    'rejected',
  );
  checks++;
  await as(requester);
  await query("select * from public.transition_book_request($1, 'canceled')", [request]);
  assert.equal(
    (await query('select status from public.listings where id = $1', [counter])).rows[0].status,
    'disponivel',
  );
  checks++;

  await reset();
  await query('select public.counter_offer($1, $2)', [request, counter]);
  await db.exec('reset role');
  await query("update public.listings set status = 'reservado' where id = $1", [counter]);
  await as(requester);
  await rejects('select public.answer_counter_offer($1, true)', [request], 'P0001');
  assert.equal((await state()).status, 'pending');
  checks++;
  await query('select public.answer_counter_offer($1, false)', [request]);
  assert.equal((await state()).status, 'rejected');
  checks++;

  await reset();
  await query('select public.counter_offer($1, $2)', [request, counter]);
  await as(requester);
  await query('select public.answer_counter_offer($1, true)', [request]);
  await as(owner);
  await query("select * from public.transition_book_request($1, 'completed')", [request]);
  assert.equal(
    (await query('select status from public.listings where id = $1', [counter])).rows[0].status,
    'concluido',
  );
  checks++;

  await reset();
  await as(requester);
  await rejects(
    `insert into public.book_requests(listing_id, requester_id, counter_listing_id, public_location, meeting_date, meeting_time)
    values ($1, $2, $3, 'Biblioteca', '2026-10-10', '10:00')`,
    [alien, requester, counter],
    '42501',
  );
  await as(null);
  await rejects('select public.counter_offer($1, $2)', [request, counter], '42501');
  await db.exec('reset role; set role anon');
  await rejects('select public.answer_counter_offer($1, true)', [request], '42501');
  console.log(`${checks} verificações SQL aprovadas; migrações aplicadas apenas em memória.`);
} finally {
  await db.close();
}
