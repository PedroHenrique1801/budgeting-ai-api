#  Budgeting AI API

Uma API RESTful de gestão financeira pessoal que utiliza Inteligência Artificial para processar áudios, extrair informações de gastos e categorizar transações automaticamente.

Este é o meu projeto base de Engenharia de Software, desenvolvido para aplicar conceitos de back-end, integração com IA e conteinerização.

## Tecnologias Utilizadas
* **Java 25**
* **Spring Boot** (Estrutura da API REST)
* **Spring AI & OpenAI (Whisper / GPT)** (Transcrição e processamento de linguagem natural)
* **MySQL** (Banco de dados relacional)
* **Docker & Docker Compose** (Gerenciamento da infraestrutura de dados)

## Como Funciona
O sistema recebe um arquivo de áudio (ex: *"Gastei 60 reais abastecendo a moto"*), utiliza modelos da OpenAI para transcrever a fala, interpreta a intenção do usuário, extrai o valor e a categoria correta (`AUTO`, `GROCERIES`, ou `PHARMA`) e persiste a transação no banco de dados, retornando uma confirmação em áudio.

## Próximos Passos (Em Desenvolvimento)
O projeto está em evolução contínua. As próximas atualizações incluem:
* Desenvolvimento de uma interface web responsiva utilizando HTML semântico e CSS (Flexbox/Grid) para consumo da API.
* Exibição de dashboards e gráficos de gastos por categoria.
* Tratamento avançado de exceções customizadas.

## Como rodar localmente
1. Certifique-se de ter o Docker e o Java instalados.
2. Clone o repositório.
3. Configure a sua chave da OpenAI nas variáveis de ambiente.
4. Suba o banco de dados com `docker-compose up -d`.
5. Execute a aplicação via IntelliJ ou terminal.