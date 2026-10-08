# 034 — Completar cadastro após entrar com Google

## Objetivo e escopo

Quem cria a conta pelo Google informa nome, senha do IpêBook e bairro antes de
acessar a área autenticada. O e-mail confirmado pelo Google fica somente leitura;
a senha pertence ao IpêBook, não altera a senha do Google e permite entrar pelo
mesmo e-mail, na mesma conta. Não criar um segundo usuário.

## Critérios de aceite

1. Conta cujo provedor inicial é Google, sem marca de conclusão, abre
   `/completar-cadastro` ao entrar, reabrir ou acessar diretamente a área do app.
2. Nome vem preenchido quando disponível e é editável; senha e confirmação seguem
   validações existentes; bairro obrigatório, em Piripiri (escopo atual do produto).
3. E-mail não pode ser alterado no formulário. Aceite de termos segue o cadastro atual.
4. Salvar bairro antes de atualizar senha/nome/marca de conclusão na conta autenticada.
   Falha mantém cadastro pendente e permite tentar novamente sem criar outra conta.
5. Concluído, encaminhar ao início; próximos logins não repetem a etapa. Contas
   originalmente criadas por e-mail não são obrigadas a definir senha novamente.
6. Senha não vai para metadados, banco de perfil, armazenamento local ou logs.
7. Carregamento, erro, offline, campos inválidos e saída da conta devem ser utilizáveis.

## Fora do escopo e riscos

Sem mudança na senha Google, novo provedor, migração SQL ou publicação. A marca
em metadados controla navegação, não autorização de dados (RLS continua vigente).
Não há transação entre Auth e perfil: bairro pode ficar salvo se a senha falhar.
Contas Google anteriores sem marca também completam uma vez, inclusive as criadas
nos testes anteriores. Senha é enviada somente à API Auth pela sessão atual.

## Referência visual

Figma consultado: Android 01.03 `336:118`, iPhone 01.03 `336:12902` e seção 01 de
ambas as plataformas. Tela nova combina componentes existentes de cadastro e bairro;
não existe quadro próprio para essa etapa. Sem novos tokens ou padrão global.
