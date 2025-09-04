# Sistema de Barbearia

Sistema web completo para gerenciamento de uma barbearia, desenvolvido com Next.js, TypeScript, TailwindCSS, shadcn/ui e Supabase.

## Funcionalidades

### Área Pública
- Home com informações da barbearia
- Galeria de fotos
- Login e cadastro de usuários

### Área do Cliente
- Agendamento de horários
- Visualização e cancelamento de agendamentos

### Área Administrativa
- Dashboard com métricas
- Gestão de agendamentos
- Gestão de barbeiros
- Gestão de clientes
- Agendamento manual

## Tecnologias

- [Next.js 14](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/)

## Pré-requisitos

- Node.js 18.17 ou superior
- NPM ou Yarn
- Conta no Supabase

## Configuração do Projeto

1. Clone o repositório:
```bash
git clone https://seu-repositorio/barbearia.git
cd barbearia
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
- Copie o arquivo `.env.example` para `.env.local`
- Preencha as variáveis com suas credenciais do Supabase

4. Configure o banco de dados no Supabase:
- Execute o SQL disponível em `supabase-setup.sql` no SQL Editor do Supabase
- Isso criará as tabelas necessárias e configurará as políticas de segurança (RLS)

## Desenvolvimento Local

```bash
npm run dev
# ou
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Deploy

### Deploy na Vercel

1. Crie uma conta na [Vercel](https://vercel.com)
2. Conecte seu repositório
3. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!

## Estrutura do Projeto

```
├── src/
│   ├── app/                 # Rotas e páginas
│   ├── components/          # Componentes React
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilitários e configurações
│   └── middleware.ts       # Middleware Next.js
├── public/                 # Arquivos estáticos
├── .env.example           # Template de variáveis de ambiente
├── next.config.js         # Configuração Next.js
├── package.json           # Dependências e scripts
├── README.md              # Documentação
├── supabase-setup.sql     # SQL para configuração do banco
└── tsconfig.json          # Configuração TypeScript
```

## Segurança

- Autenticação gerenciada pelo Supabase Auth
- Row Level Security (RLS) para proteção dos dados
- Middleware Next.js para proteção de rotas
- Validação de permissões por tipo de usuário (admin/cliente)

## Contribuição

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
