# Plano

Base: develop em 2a92825, preservando correções OAuth ainda não commitadas.
Estado inicial: tipos, lint e 32 arquivos de teste aprovados na correção anterior;
retorno real ainda não comprovou sessão autenticada. Usuário autorizou esta evolução.

Model: estado opcional de cadastro pendente no usuário; operação Auth de conclusão
na mesma identidade; serviço coordena perfil antes de Auth com validações existentes.
ViewModel: carrega bairro, edita dados, valida, trata falhas e bloqueia envio duplo.
View: AuthLayout, TextField, Checkbox e Button existentes; e-mail fixo e explicação
sobre senha do IpêBook. Proteções das rotas encaminham cadastros pendentes.

Validação: testes de mapeamento/provedor, ordem das gravações, falha parcial, senha
no lugar correto, login posterior na mesma identidade, retomada e ViewModel. Tipos,
lint, formatação e testes gerais. Inspeção visual Android e Web quando disponíveis;
sem Playwright. Fluxo real não será declarado validado por testes simulados.

Superpowers e Context7 não disponíveis nesta sessão; documentação oficial Supabase
consultada. Expo SDK 57 já consultado; nenhuma dependência nova nesta funcionalidade.
Decisão: ADR 0033.
