/** Spec 039: banco PostgreSQL isolado via PGlite; não acessa dados reais. */
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
if (!process.argv[2]) throw new Error('Informe o caminho de @electric-sql/pglite/dist/index.js.');
const { PGlite } = await import(pathToFileURL(resolve(process.argv[2])).href);
const db = new PGlite();
const uuid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const owner = uuid(1),
  buyer = uuid(2),
  outsider = uuid(3),
  book = uuid(10),
  request = uuid(20);
const point = { name: 'Biblioteca de teste', latitude: -4.273, longitude: -41.776 };
const query = (sql, params = []) => db.query(sql, params);
async function as(user) {
  await db.exec('reset role');
  await query("select set_config('request.jwt.claim.sub', $1, false)", [user]);
  await db.exec('set role authenticated');
}
async function rejects(sql, params, code) {
  await assert.rejects(query(sql, params), (error) => error.code === code);
}
try {
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth; create schema storage;
    create table auth.users (id uuid primary key, raw_user_meta_data jsonb default '{}', raw_app_meta_data jsonb default '{}', created_at timestamptz default now(), deleted_at timestamptz);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create table storage.buckets (id text primary key, name text, public boolean);
    create table storage.objects (id uuid primary key, bucket_id text, name text);
    create function storage.foldername(text) returns text[] language sql immutable as $$ select string_to_array($1, '/') $$;
    grant usage on schema public, auth, storage to authenticated, anon;
    grant execute on function auth.uid() to authenticated, anon;
  `);

  const migrations = new URL('../supabase/migrations/', import.meta.url);
  for (const name of (await readdir(migrations)).filter((name) => name.endsWith('.sql')).sort()) {
    try {
      await db.exec(await readFile(new URL(name, migrations), 'utf8'));
    } catch (error) {
      throw new Error(`Migração ${name}: ${error.code} — ${error.message}`);
    }
  }
  await db.exec(
    'grant select, insert, update, delete on all tables in schema public to authenticated',
  );
  for (const id of [owner, buyer, outsider])
    await query('insert into auth.users(id) values ($1)', [id]);
  await as(owner);
  await query(
    `insert into public.listings(id,owner_id,title,author,category,modality,condition,meeting_point)
 values($1,$2,'Livro de teste','Autor de teste','Literatura brasileira','donation','bom',$3)`,
    [book, owner, point],
  );
  for (const invalid of [
    { ...point, latitude: 91 },
    { ...point, name: '' },
    { ...point, longitude: 181 },
    { ...point, latitude: '-4' },
    { ...point, address: 'privado' },
    {},
  ])
    await rejects(
      'update public.listings set meeting_point=$1 where id=$2',
      [invalid, book],
      '23514',
    );
  await as(buyer);
  let catalog = (
    await query('select meeting_point from public.catalog_listings where id=$1', [book])
  ).rows;
  assert.deepEqual(catalog[0].meeting_point, point);
  const changed = await query(
    'update public.listings set meeting_point=null where id=$1 returning id',
    [book],
  );
  assert.equal(changed.rows.length, 0);
  await query('insert into public.user_blocks(blocker_id,blocked_id) values($1,$2)', [
    buyer,
    owner,
  ]);
  assert.equal(
    (await query('select id from public.catalog_listings where id=$1', [book])).rows.length,
    0,
  );
  await query('delete from public.user_blocks where blocker_id=$1', [buyer]);
  await query('insert into public.book_requests(id,listing_id,requester_id) values($1,$2,$3)', [
    request,
    book,
    buyer,
  ]);
  await as(outsider);
  await rejects(
    'select * from public.propose_meeting_with_point($1,$2,$3,$4,$5)',
    [request, point.name, '2026-10-20', '10:00', point],
    'P0002',
  );
  await as(buyer);
  await rejects(
    'select * from public.propose_meeting_with_point($1,$2,$3,$4,$5)',
    [request, point.name, '2026-10-20', '10:00', { ...point, latitude: 100 }],
    '23514',
  );
  assert.equal(
    (await query('select public_location from public.book_requests where id=$1', [request])).rows[0]
      .public_location,
    null,
  );
  await query('select * from public.propose_meeting_with_point($1,$2,$3,$4,$5)', [
    request,
    point.name,
    '2026-10-20',
    '10:00',
    point,
  ]);
  await as(owner);
  await query('update public.listings set meeting_point=null where id=$1', [book]);
  assert.deepEqual(
    (await query('select meeting_point from public.book_requests where id=$1', [request])).rows[0]
      .meeting_point,
    point,
  );
  await query("select * from public.transition_book_request($1,'accepted')", [request]);
  await query('select * from public.reschedule_book_request_with_point($1,$2,$3,$4,$5)', [
    request,
    'Outro local',
    '2026-10-21',
    '11:00',
    null,
  ]);
  assert.equal(
    (await query('select meeting_point from public.book_requests where id=$1', [request])).rows[0]
      .meeting_point,
    null,
  );
  await query('select * from public.reschedule_book_request_with_point($1,$2,$3,$4,$5)', [
    request,
    point.name,
    '2026-10-22',
    '12:00',
    point,
  ]);
  await query('select * from public.reschedule_book_request($1,$2,$3,$4)', [
    request,
    'Mudança pelo cliente antigo',
    '2026-10-23',
    '13:00',
  ]);
  assert.equal(
    (await query('select meeting_point from public.book_requests where id=$1', [request])).rows[0]
      .meeting_point,
    null,
  );
  await as(outsider);
  assert.equal(
    (await query('select id from public.book_requests where id=$1', [request])).rows.length,
    0,
  );
  console.log(
    'Mapa SQL: migrações, constraints, RLS, bloqueios, cópia independente, rollback e cliente antigo verificados.',
  );
} finally {
  await db.close();
}
