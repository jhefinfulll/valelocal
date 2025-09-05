import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'ValeLocal Sistema API',
      version: '1.0.0',
      description: 'API completa do Sistema ValeLocal para gestão de franquias, estabelecimentos, cartões e transações.',
      contact: {
        name: 'Equipe ValeLocal',
        email: 'dev@valelocal.com.br'
      }
    },
    servers: [
      {
        url: process.env.SWAGGER_SERVER_URL || (process.env.NODE_ENV === 'production' 
          ? 'https://seu-dominio.com.br' 
          : 'http://localhost:3001'),
        description: process.env.SWAGGER_SERVER_DESCRIPTION || (process.env.NODE_ENV === 'production' ? 'Servidor de Produção' : 'Servidor de Desenvolvimento')
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT para autenticação'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensagem de erro'
            },
            details: {
              type: 'string',
              description: 'Detalhes adicionais do erro'
            }
          },
          required: ['error']
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica se a operação foi bem-sucedida'
            },
            message: {
              type: 'string',
              description: 'Mensagem de sucesso'
            },
            data: {
              type: 'object',
              description: 'Dados retornados pela operação'
            }
          },
          required: ['success']
        },
        Franqueado: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único do franqueado'
            },
            name: {
              type: 'string',
              description: 'Nome do franqueado'
            },
            cnpj: {
              type: 'string',
              description: 'CNPJ do franqueado (14 dígitos)'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do franqueado'
            },
            phone: {
              type: 'string',
              description: 'Telefone do franqueado'
            },
            address: {
              type: 'string',
              description: 'Endereço completo do franqueado'
            },
            region: {
              type: 'string',
              description: 'Região de atuação do franqueado'
            },
            comissionRate: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Taxa de comissão em porcentagem'
            },
            status: {
              type: 'string',
              enum: ['ATIVO', 'INATIVO'],
              description: 'Status do franqueado'
            },
            logo: {
              type: 'string',
              format: 'uri',
              description: 'URL do logo do franqueado'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de última atualização'
            },
            franqueadoras: {
              type: 'object',
              properties: {
                id: {
                  type: 'string'
                },
                name: {
                  type: 'string'
                }
              },
              description: 'Informações da franqueadora'
            },
            _count: {
              type: 'object',
              properties: {
                estabelecimentos: {
                  type: 'integer',
                  description: 'Número de estabelecimentos'
                },
                cartoes: {
                  type: 'integer',
                  description: 'Número de cartões'
                },
                comissoes: {
                  type: 'integer',
                  description: 'Número de comissões'
                }
              },
              description: 'Contadores relacionados'
            }
          },
          required: ['id', 'name', 'cnpj', 'email', 'phone', 'address', 'region', 'comissionRate', 'status']
        },
        CreateFranqueado: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              description: 'Nome do franqueado'
            },
            cnpj: {
              type: 'string',
              pattern: '^\\d{14}$',
              description: 'CNPJ do franqueado (14 dígitos)'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do franqueado'
            },
            phone: {
              type: 'string',
              minLength: 10,
              description: 'Telefone do franqueado'
            },
            address: {
              type: 'string',
              minLength: 10,
              description: 'Endereço completo do franqueado'
            },
            region: {
              type: 'string',
              minLength: 2,
              description: 'Região de atuação do franqueado'
            },
            comissionRate: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Taxa de comissão em porcentagem'
            },
            franqueadoraId: {
              type: 'string',
              description: 'ID da franqueadora'
            },
            logo: {
              type: 'string',
              format: 'uri',
              description: 'URL do logo do franqueado'
            }
          },
          required: ['name', 'cnpj', 'email', 'phone', 'address', 'region', 'comissionRate', 'franqueadoraId']
        },
        UpdateFranqueado: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              description: 'Nome do franqueado'
            },
            cnpj: {
              type: 'string',
              pattern: '^\\d{14}$',
              description: 'CNPJ do franqueado (14 dígitos)'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do franqueado'
            },
            phone: {
              type: 'string',
              minLength: 10,
              description: 'Telefone do franqueado'
            },
            address: {
              type: 'string',
              minLength: 10,
              description: 'Endereço completo do franqueado'
            },
            region: {
              type: 'string',
              minLength: 2,
              description: 'Região de atuação do franqueado'
            },
            comissionRate: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Taxa de comissão em porcentagem'
            },
            logo: {
              type: 'string',
              format: 'uri',
              description: 'URL do logo do franqueado'
            }
          }
        },
        Estabelecimento: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único do estabelecimento'
            },
            name: {
              type: 'string',
              description: 'Nome do estabelecimento'
            },
            cnpj: {
              type: 'string',
              description: 'CNPJ do estabelecimento (14 dígitos)'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do estabelecimento'
            },
            phone: {
              type: 'string',
              description: 'Telefone do estabelecimento'
            },
            address: {
              type: 'string',
              description: 'Endereço completo do estabelecimento'
            },
            category: {
              type: 'string',
              enum: ['Alimentação', 'Varejo', 'Serviços', 'Saúde', 'Educação', 'Outros'],
              description: 'Categoria do estabelecimento'
            },
            status: {
              type: 'string',
              enum: ['RASCUNHO', 'PENDENTE_PAGAMENTO', 'ATIVO', 'SUSPENSO', 'CANCELADO'],
              description: 'Status do estabelecimento'
            },
            franqueadoId: {
              type: 'string',
              description: 'ID do franqueado responsável'
            },
            logo: {
              type: 'string',
              format: 'uri',
              description: 'URL do logo do estabelecimento'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de última atualização'
            },
            franqueado: {
              type: 'object',
              properties: {
                id: {
                  type: 'string'
                },
                name: {
                  type: 'string'
                },
                region: {
                  type: 'string'
                }
              },
              description: 'Informações do franqueado'
            },
            coords: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  lat: {
                    type: 'number',
                    description: 'Latitude'
                  },
                  lng: {
                    type: 'number',
                    description: 'Longitude'
                  }
                }
              },
              description: 'Coordenadas do estabelecimento'
            },
            _count: {
              type: 'object',
              properties: {
                cartoes: {
                  type: 'integer',
                  description: 'Número de cartões'
                },
                transacoes: {
                  type: 'integer',
                  description: 'Número de transações'
                },
                displays: {
                  type: 'integer',
                  description: 'Número de displays'
                }
              },
              description: 'Contadores relacionados'
            }
          },
          required: ['id', 'name', 'cnpj', 'email', 'phone', 'address', 'category', 'status', 'franqueadoId']
        },
        CreateEstabelecimento: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              description: 'Nome do estabelecimento'
            },
            cnpj: {
              type: 'string',
              pattern: '^\\d{14}$',
              description: 'CNPJ do estabelecimento (14 dígitos)'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do estabelecimento'
            },
            phone: {
              type: 'string',
              minLength: 10,
              description: 'Telefone do estabelecimento'
            },
            address: {
              type: 'string',
              minLength: 10,
              description: 'Endereço completo do estabelecimento'
            },
            category: {
              type: 'string',
              enum: ['Alimentação', 'Varejo', 'Serviços', 'Saúde', 'Educação', 'Outros'],
              description: 'Categoria do estabelecimento'
            },
            franqueadoId: {
              type: 'string',
              description: 'ID do franqueado'
            },
            logo: {
              type: 'string',
              format: 'uri',
              description: 'URL do logo do estabelecimento'
            }
          },
          required: ['name', 'cnpj', 'email', 'phone', 'address', 'category', 'franqueadoId']
        },
        UpdateEstabelecimento: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              description: 'Nome do estabelecimento'
            },
            cnpj: {
              type: 'string',
              pattern: '^\\d{14}$',
              description: 'CNPJ do estabelecimento (14 dígitos)'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do estabelecimento'
            },
            phone: {
              type: 'string',
              minLength: 10,
              description: 'Telefone do estabelecimento'
            },
            address: {
              type: 'string',
              minLength: 10,
              description: 'Endereço completo do estabelecimento'
            },
            category: {
              type: 'string',
              enum: ['Alimentação', 'Varejo', 'Serviços', 'Saúde', 'Educação', 'Outros'],
              description: 'Categoria do estabelecimento'
            },
            franqueadoId: {
              type: 'string',
              description: 'ID do franqueado'
            },
            logo: {
              type: 'string',
              format: 'uri',
              description: 'URL do logo do estabelecimento'
            }
          }
        },
        Cartao: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único do cartão'
            },
            codigo: {
              type: 'string',
              description: 'Código único do cartão'
            },
            qrCode: {
              type: 'string',
              description: 'Código QR do cartão'
            },
            valor: {
              type: 'number',
              minimum: 0,
              description: 'Valor disponível no cartão'
            },
            status: {
              type: 'string',
              enum: ['DISPONIVEL', 'ATIVO', 'UTILIZADO', 'EXPIRADO'],
              description: 'Status do cartão'
            },
            franqueadoId: {
              type: 'string',
              description: 'ID do franqueado responsável'
            },
            estabelecimentoId: {
              type: 'string',
              nullable: true,
              description: 'ID do estabelecimento (opcional para cartões gerais)'
            },
            dataAtivacao: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Data de ativação do cartão'
            },
            dataUtilizacao: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Data de utilização do cartão'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de última atualização'
            },
            franqueado: {
              type: 'object',
              properties: {
                id: {
                  type: 'string'
                },
                name: {
                  type: 'string'
                },
                region: {
                  type: 'string'
                }
              },
              description: 'Informações do franqueado'
            },
            estabelecimento: {
              type: 'object',
              nullable: true,
              properties: {
                id: {
                  type: 'string'
                },
                name: {
                  type: 'string'
                },
                category: {
                  type: 'string'
                }
              },
              description: 'Informações do estabelecimento'
            }
          },
          required: ['id', 'codigo', 'qrCode', 'valor', 'status', 'franqueadoId']
        },
        CreateCartao: {
          type: 'object',
          properties: {
            codigo: {
              type: 'string',
              minLength: 3,
              description: 'Código único do cartão'
            },
            qrCode: {
              type: 'string',
              description: 'Código QR do cartão (gerado automaticamente se não fornecido)'
            },
            valor: {
              type: 'number',
              minimum: 0,
              default: 0,
              description: 'Valor inicial do cartão'
            },
            franqueadoId: {
              type: 'string',
              description: 'ID do franqueado responsável'
            },
            estabelecimentoId: {
              type: 'string',
              description: 'ID do estabelecimento (opcional)'
            }
          },
          required: ['codigo', 'franqueadoId']
        },
        UpdateCartao: {
          type: 'object',
          properties: {
            codigo: {
              type: 'string',
              minLength: 3,
              description: 'Código único do cartão'
            },
            valor: {
              type: 'number',
              minimum: 0,
              description: 'Valor do cartão'
            },
            status: {
              type: 'string',
              enum: ['DISPONIVEL', 'ATIVO', 'UTILIZADO', 'EXPIRADO'],
              description: 'Status do cartão'
            },
            franqueadoId: {
              type: 'string',
              description: 'ID do franqueado responsável'
            },
            estabelecimentoId: {
              type: 'string',
              description: 'ID do estabelecimento'
            }
          }
        },
        CartaoAction: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['recarregar', 'bloquear', 'ativar', 'gerar-qr'],
              description: 'Ação a ser executada no cartão'
            },
            valor: {
              type: 'number',
              minimum: 0,
              description: 'Valor para recarga (obrigatório para ação "recarregar")'
            }
          },
          required: ['action']
        },
        QRCodeResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica se a operação foi bem-sucedida'
            },
            qrCode: {
              type: 'string',
              description: 'Código QR gerado'
            },
            dataUrl: {
              type: 'string',
              description: 'URL de dados da imagem do QR Code'
            }
          },
          required: ['success', 'qrCode', 'dataUrl']
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object'
              },
              description: 'Array de dados paginados'
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  minimum: 1,
                  description: 'Página atual'
                },
                limit: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 100,
                  description: 'Limite de itens por página'
                },
                total: {
                  type: 'integer',
                  minimum: 0,
                  description: 'Total de itens'
                },
                totalPages: {
                  type: 'integer',
                  minimum: 0,
                  description: 'Total de páginas'
                }
              },
              required: ['page', 'limit', 'total', 'totalPages']
            }
          },
          required: ['data', 'pagination']
        },
        LoginRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Senha do usuário'
            }
          },
          required: ['email', 'password']
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica se o login foi bem-sucedido'
            },
            token: {
              type: 'string',
              description: 'Token JWT para autenticação'
            },
            user: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'ID do usuário'
                },
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'Email do usuário'
                },
                name: {
                  type: 'string',
                  description: 'Nome do usuário'
                },
                type: {
                  type: 'string',
                  enum: ['FRANQUEADORA', 'FRANQUEADO', 'ESTABELECIMENTO', 'USUARIO_FINAL'],
                  description: 'Tipo do usuário'
                }
              },
              required: ['id', 'email', 'name', 'type']
            }
          },
          required: ['success', 'token', 'user']
        },
        CobrancaAsaas: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único da cobrança'
            },
            estabelecimentoId: {
              type: 'string',
              description: 'ID do estabelecimento'
            },
            franqueadoId: {
              type: 'string',
              description: 'ID do franqueado'
            },
            asaasChargeId: {
              type: 'string',
              nullable: true,
              description: 'ID da cobrança no Asaas'
            },
            valor: {
              type: 'number',
              format: 'decimal',
              description: 'Valor da cobrança'
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'PAID', 'EXPIRED', 'CANCELLED'],
              description: 'Status da cobrança'
            },
            tipo: {
              type: 'string',
              enum: ['ATIVACAO_ESTABELECIMENTO', 'REPOSICAO_CARTOES'],
              description: 'Tipo da cobrança'
            },
            vencimento: {
              type: 'string',
              format: 'date-time',
              description: 'Data de vencimento'
            },
            urlPagamento: {
              type: 'string',
              format: 'uri',
              nullable: true,
              description: 'URL para pagamento'
            },
            pixQrCode: {
              type: 'string',
              nullable: true,
              description: 'Código PIX para pagamento'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            },
            paidAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Data de pagamento'
            }
          },
          required: ['id', 'estabelecimentoId', 'franqueadoId', 'valor', 'status', 'tipo', 'vencimento']
        },
        WebhookAsaasEvent: {
          type: 'object',
          properties: {
            event: {
              type: 'string',
              enum: ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED', 'PAYMENT_OVERDUE', 'PAYMENT_DELETED'],
              description: 'Tipo do evento'
            },
            payment: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'ID do pagamento no Asaas'
                },
                status: {
                  type: 'string',
                  description: 'Status do pagamento'
                },
                value: {
                  type: 'number',
                  description: 'Valor do pagamento'
                }
              },
              required: ['id', 'status']
            }
          },
          required: ['event', 'payment']
        },
        EstabelecimentoPagamento: {
          type: 'object',
          properties: {
            estabelecimento: {
              $ref: '#/components/schemas/Estabelecimento'
            },
            pagamento: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['PENDENTE', 'PAGO', 'VENCIDO'],
                  description: 'Status do pagamento'
                },
                valor: {
                  type: 'number',
                  description: 'Valor da taxa de ativação'
                },
                vencimento: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Data de vencimento'
                },
                urlPagamento: {
                  type: 'string',
                  format: 'uri',
                  description: 'URL para pagamento'
                },
                pixQrCode: {
                  type: 'string',
                  description: 'Código PIX para pagamento'
                },
                instrucoes: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'Instruções de pagamento'
                }
              },
              required: ['status', 'valor', 'vencimento']
            }
          },
          required: ['estabelecimento']
        },
        TesteEstabelecimento: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensagem informativa'
            },
            dadosExemplo: {
              $ref: '#/components/schemas/CreateEstabelecimento'
            },
            instrucoes: {
              type: 'string',
              description: 'Instruções para teste'
            },
            endpoints: {
              type: 'object',
              properties: {
                criar: {
                  type: 'string',
                  description: 'Endpoint para criar estabelecimento'
                },
                webhook: {
                  type: 'string',
                  description: 'Endpoint do webhook'
                },
                listar: {
                  type: 'string',
                  description: 'Endpoint para listar estabelecimentos'
                }
              }
            }
          }
        }
      },
      responses: {
        BadRequest: {
          description: 'Requisição inválida',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        Unauthorized: {
          description: 'Não autorizado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        Forbidden: {
          description: 'Acesso negado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Erro interno do servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      },
      parameters: {
        PageQuery: {
          name: 'page',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          },
          description: 'Número da página para paginação'
        },
        LimitQuery: {
          name: 'limit',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          },
          description: 'Limite de itens por página'
        },
        SearchQuery: {
          name: 'search',
          in: 'query',
          schema: {
            type: 'string'
          },
          description: 'Termo de busca para filtrar resultados'
        },
        StatusQuery: {
          name: 'status',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['ATIVO', 'INATIVO']
          },
          description: 'Filtro por status'
        },
        CartaoStatusQuery: {
          name: 'status',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['DISPONIVEL', 'ATIVO', 'UTILIZADO', 'EXPIRADO']
          },
          description: 'Filtro por status do cartão'
        },
        FranqueadoIdQuery: {
          name: 'franqueadoId',
          in: 'query',
          schema: {
            type: 'string'
          },
          description: 'Filtro por ID do franqueado'
        },
        EstabelecimentoIdQuery: {
          name: 'estabelecimentoId',
          in: 'query',
          schema: {
            type: 'string'
          },
          description: 'Filtro por ID do estabelecimento'
        }
      }
    },
    tags: [
      {
        name: 'Autenticação',
        description: 'Endpoints para autenticação e autorização de usuários'
      },
      {
        name: 'Franqueados',
        description: 'Gestão de franqueados do sistema'
      },
      {
        name: 'Estabelecimentos',
        description: 'Gestão de estabelecimentos parceiros'
      },
      {
        name: 'Cartões',
        description: 'Gestão de cartões vale-alimentação'
      },
      {
        name: 'Transações',
        description: 'Histórico e gestão de transações'
      },
      {
        name: 'Comissões',
        description: 'Gestão de comissões e pagamentos'
      },
      {
        name: 'Configurações',
        description: 'Configurações do sistema'
      },
      {
        name: 'Displays',
        description: 'Gestão de displays e equipamentos'
      },
      {
        name: 'Solicitações',
        description: 'Gestão de solicitações e aprovações'
      },
      {
        name: 'Relatórios',
        description: 'Relatórios e dashboards do sistema'
      },
      {
        name: 'Logs',
        description: 'Logs de auditoria e atividades'
      },
      {
        name: 'Dashboard',
        description: 'Métricas e KPIs do sistema'
      },
      {
        name: 'Webhooks',
        description: 'Endpoints para receber notificações de pagamento'
      },
      {
        name: 'Pagamentos',
        description: 'Gestão de pagamentos e cobranças via Asaas'
      },
      {
        name: 'Teste',
        description: 'Endpoints para testes e demonstrações'
      }
    ],
    externalDocs: {
      description: 'Documentação do Sistema ValeLocal',
      url: 'https://docs.valelocal.com.br'
    },
    security: [
      {
        BearerAuth: []
      }
    ],
    paths: {
      '/api/auth/login': {
        post: {
          tags: ['Autenticação'],
          summary: 'Fazer login no sistema',
          description: 'Autenticar usuário e obter token JWT',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginRequest'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Login realizado com sucesso',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/LoginResponse'
                  }
                }
              }
            },
            '401': {
              $ref: '#/components/responses/Unauthorized'
            },
            '400': {
              $ref: '#/components/responses/BadRequest'
            }
          }
        }
      },
      '/api/auth/me': {
        get: {
          tags: ['Autenticação'],
          summary: 'Obter dados do usuário logado',
          description: 'Retorna os dados do usuário autenticado',
          security: [{ BearerAuth: [] }],
          responses: {
            '200': {
              description: 'Dados do usuário',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      user: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          email: { type: 'string' },
                          name: { type: 'string' },
                          type: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '401': {
              $ref: '#/components/responses/Unauthorized'
            }
          }
        }
      },
      '/api/franqueados': {
        get: {
          tags: ['Franqueados'],
          summary: 'Listar franqueados',
          description: 'Retorna lista paginada de franqueados',
          security: [{ BearerAuth: [] }],
          parameters: [
            { $ref: '#/components/parameters/PageQuery' },
            { $ref: '#/components/parameters/LimitQuery' },
            { $ref: '#/components/parameters/SearchQuery' },
            { $ref: '#/components/parameters/StatusQuery' }
          ],
          responses: {
            '200': {
              description: 'Lista de franqueados',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/PaginatedResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Franqueado' }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' }
          }
        },
        post: {
          tags: ['Franqueados'],
          summary: 'Criar novo franqueado',
          description: 'Cria um novo franqueado no sistema',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateFranqueado' }
              }
            }
          },
          responses: {
            '201': {
              description: 'Franqueado criado com sucesso',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Franqueado' }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' }
          }
        }
      },
      '/api/franqueados/{id}': {
        get: {
          tags: ['Franqueados'],
          summary: 'Obter franqueado por ID',
          description: 'Retorna dados de um franqueado específico',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID do franqueado'
            }
          ],
          responses: {
            '200': {
              description: 'Dados do franqueado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Franqueado' }
                }
              }
            },
            '404': {
              description: 'Franqueado não encontrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        put: {
          tags: ['Franqueados'],
          summary: 'Atualizar franqueado',
          description: 'Atualiza dados de um franqueado existente',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID do franqueado'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateFranqueado' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Franqueado atualizado com sucesso',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Franqueado' }
                }
              }
            },
            '404': {
              description: 'Franqueado não encontrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        delete: {
          tags: ['Franqueados'],
          summary: 'Deletar franqueado',
          description: 'Remove um franqueado do sistema',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID do franqueado'
            }
          ],
          responses: {
            '200': {
              description: 'Franqueado deletado com sucesso',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            },
            '404': {
              description: 'Franqueado não encontrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' }
          }
        }
      },
      '/api/estabelecimentos': {
        get: {
          tags: ['Estabelecimentos'],
          summary: 'Listar estabelecimentos',
          description: 'Retorna lista paginada de estabelecimentos',
          security: [{ BearerAuth: [] }],
          parameters: [
            { $ref: '#/components/parameters/PageQuery' },
            { $ref: '#/components/parameters/LimitQuery' },
            { $ref: '#/components/parameters/SearchQuery' },
            { $ref: '#/components/parameters/StatusQuery' },
            { $ref: '#/components/parameters/FranqueadoIdQuery' }
          ],
          responses: {
            '200': {
              description: 'Lista de estabelecimentos',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/PaginatedResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Estabelecimento' }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        post: {
          tags: ['Estabelecimentos'],
          summary: 'Criar novo estabelecimento',
          description: 'Cria um novo estabelecimento no sistema',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateEstabelecimento' }
              }
            }
          },
          responses: {
            '201': {
              description: 'Estabelecimento criado com sucesso',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Estabelecimento' }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' }
          }
        }
      },
      '/api/estabelecimentos/{id}': {
        get: {
          tags: ['Estabelecimentos'],
          summary: 'Obter estabelecimento por ID',
          description: 'Retorna dados de um estabelecimento específico',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID do estabelecimento'
            }
          ],
          responses: {
            '200': {
              description: 'Dados do estabelecimento',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Estabelecimento' }
                }
              }
            },
            '404': {
              description: 'Estabelecimento não encontrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        put: {
          tags: ['Estabelecimentos'],
          summary: 'Atualizar estabelecimento',
          description: 'Atualiza dados de um estabelecimento existente',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID do estabelecimento'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateEstabelecimento' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Estabelecimento atualizado com sucesso',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Estabelecimento' }
                }
              }
            },
            '404': {
              description: 'Estabelecimento não encontrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        delete: {
          tags: ['Estabelecimentos'],
          summary: 'Deletar estabelecimento',
          description: 'Remove um estabelecimento do sistema',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID do estabelecimento'
            }
          ],
          responses: {
            '200': {
              description: 'Estabelecimento deletado com sucesso',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            },
            '404': {
              description: 'Estabelecimento não encontrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' }
          }
        }
      },
      '/api/cartoes': {
        get: {
          tags: ['Cartões'],
          summary: 'Listar cartões',
          description: 'Retorna lista paginada de cartões',
          security: [{ BearerAuth: [] }],
          parameters: [
            { $ref: '#/components/parameters/PageQuery' },
            { $ref: '#/components/parameters/LimitQuery' },
            { $ref: '#/components/parameters/SearchQuery' },
            { $ref: '#/components/parameters/CartaoStatusQuery' },
            { $ref: '#/components/parameters/FranqueadoIdQuery' },
            { $ref: '#/components/parameters/EstabelecimentoIdQuery' }
          ],
          responses: {
            '200': {
              description: 'Lista de cartões',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/PaginatedResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Cartao' }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        post: {
          tags: ['Cartões'],
          summary: 'Criar novo cartão',
          description: 'Cria um novo cartão no sistema',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateCartao' }
              }
            }
          },
          responses: {
            '201': {
              description: 'Cartão criado com sucesso',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Cartao' }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' }
          }
        }
      },
      '/api/cartoes/{id}': {
        get: {
          tags: ['Cartões'],
          summary: 'Obter cartão por ID',
          description: 'Retorna dados de um cartão específico',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID do cartão'
            }
          ],
          responses: {
            '200': {
              description: 'Dados do cartão',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Cartao' }
                }
              }
            },
            '404': {
              description: 'Cartão não encontrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        put: {
          tags: ['Cartões'],
          summary: 'Atualizar cartão',
          description: 'Atualiza dados de um cartão existente',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID do cartão'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateCartao' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Cartão atualizado com sucesso',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Cartao' }
                }
              }
            },
            '404': {
              description: 'Cartão não encontrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        delete: {
          tags: ['Cartões'],
          summary: 'Deletar cartão',
          description: 'Remove um cartão do sistema',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID do cartão'
            }
          ],
          responses: {
            '200': {
              description: 'Cartão deletado com sucesso',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Success' }
                }
              }
            },
            '404': {
              description: 'Cartão não encontrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' }
          }
        }
      },
      '/api/cartoes/{id}/actions': {
        post: {
          tags: ['Cartões'],
          summary: 'Executar ação no cartão',
          description: 'Executa ações como recarregar, bloquear, ativar ou gerar QR Code',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID do cartão'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CartaoAction' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Ação executada com sucesso',
              content: {
                'application/json': {
                  schema: {
                    oneOf: [
                      { $ref: '#/components/schemas/Success' },
                      { $ref: '#/components/schemas/QRCodeResponse' }
                    ]
                  }
                }
              }
            },
            '404': {
              description: 'Cartão não encontrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/api/transacoes': {
        get: {
          tags: ['Transações'],
          summary: 'Listar transações',
          description: 'Retorna lista paginada de transações com filtros avançados',
          security: [{ BearerAuth: [] }],
          parameters: [
            { $ref: '#/components/parameters/PageQuery' },
            { $ref: '#/components/parameters/LimitQuery' },
            { $ref: '#/components/parameters/SearchQuery' },
            {
              name: 'cartaoId',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filtro por ID do cartão'
            },
            {
              name: 'tipo',
              in: 'query',
              schema: { type: 'string', enum: ['COMPRA', 'RECARGA'] },
              description: 'Filtro por tipo de transação'
            },
            {
              name: 'status',
              in: 'query',
              schema: { type: 'string', enum: ['PENDENTE', 'APROVADA', 'REJEITADA'] },
              description: 'Filtro por status da transação'
            },
            {
              name: 'dataInicio',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Data de início do filtro'
            },
            {
              name: 'dataFim',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Data de fim do filtro'
            }
          ],
          responses: {
            '200': {
              description: 'Lista de transações com paginação',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PaginatedResponse' }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        post: {
          tags: ['Transações'],
          summary: 'Criar nova transação',
          description: 'Cria uma nova transação no sistema com criação automática de comissão',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    cartaoId: { 
                      type: 'string',
                      description: 'ID do cartão para a transação'
                    },
                    estabelecimentoId: {
                      type: 'string',
                      description: 'ID do estabelecimento'
                    },
                    valor: { 
                      type: 'number', 
                      minimum: 0.01,
                      description: 'Valor da transação em reais'
                    },
                    tipo: { 
                      type: 'string', 
                      enum: ['COMPRA', 'RECARGA'],
                      description: 'Tipo da transação'
                    },
                    descricao: {
                      type: 'string',
                      description: 'Descrição da transação (opcional)'
                    }
                  },
                  required: ['cartaoId', 'estabelecimentoId', 'valor', 'tipo']
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Transação criada com sucesso',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      transacao: { type: 'object' },
                      comissao: { type: 'object' }
                    }
                  }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/api/transacoes/{id}': {
        get: {
          tags: ['Transações'],
          summary: 'Obter transação por ID',
          description: 'Retorna dados completos de uma transação específica',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID da transação'
            }
          ],
          responses: {
            '200': {
              description: 'Dados da transação',
              content: {
                'application/json': {
                  schema: { type: 'object' }
                }
              }
            },
            '404': {
              description: 'Transação não encontrada'
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        put: {
          tags: ['Transações'],
          summary: 'Atualizar transação',
          description: 'Atualiza dados de uma transação existente',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID da transação'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { 
                      type: 'string', 
                      enum: ['PENDENTE', 'APROVADA', 'REJEITADA'],
                      description: 'Novo status da transação'
                    },
                    descricao: {
                      type: 'string',
                      description: 'Nova descrição da transação'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Transação atualizada com sucesso'
            },
            '404': {
              description: 'Transação não encontrada'
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        delete: {
          tags: ['Transações'],
          summary: 'Deletar transação',
          description: 'Remove uma transação do sistema (apenas se pendente)',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID da transação'
            }
          ],
          responses: {
            '200': {
              description: 'Transação deletada com sucesso'
            },
            '404': {
              description: 'Transação não encontrada'
            },
            '400': {
              description: 'Transação não pode ser deletada'
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/api/comissoes': {
        get: {
          tags: ['Comissões'],
          summary: 'Listar comissões',
          description: 'Retorna lista paginada de comissões com filtros detalhados',
          security: [{ BearerAuth: [] }],
          parameters: [
            { $ref: '#/components/parameters/PageQuery' },
            { $ref: '#/components/parameters/LimitQuery' },
            { $ref: '#/components/parameters/SearchQuery' },
            {
              name: 'status',
              in: 'query',
              schema: { type: 'string', enum: ['PENDENTE', 'PAGA', 'CANCELADA'] },
              description: 'Filtro por status da comissão'
            },
            {
              name: 'franqueadoId',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filtro por ID do franqueado'
            },
            {
              name: 'mesAno',
              in: 'query',
              schema: { type: 'string', pattern: '^\\d{4}-\\d{2}$' },
              description: 'Filtro por mês/ano (formato: YYYY-MM)'
            }
          ],
          responses: {
            '200': {
              description: 'Lista de comissões com estatísticas',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/PaginatedResponse' },
                      {
                        type: 'object',
                        properties: {
                          stats: {
                            type: 'object',
                            properties: {
                              totalPendente: { type: 'number' },
                              totalPago: { type: 'number' },
                              totalCancelado: { type: 'number' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        post: {
          tags: ['Comissões'],
          summary: 'Criar nova comissão',
          description: 'Cria uma nova comissão manualmente no sistema',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    franqueadoId: {
                      type: 'string',
                      description: 'ID do franqueado'
                    },
                    transacaoId: {
                      type: 'string',
                      description: 'ID da transação relacionada'
                    },
                    valor: {
                      type: 'number',
                      minimum: 0,
                      description: 'Valor da comissão'
                    },
                    percentual: {
                      type: 'number',
                      minimum: 0,
                      maximum: 100,
                      description: 'Percentual aplicado'
                    },
                    descricao: {
                      type: 'string',
                      description: 'Descrição da comissão'
                    }
                  },
                  required: ['franqueadoId', 'transacaoId', 'valor', 'percentual']
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Comissão criada com sucesso'
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/api/comissoes/{id}': {
        get: {
          tags: ['Comissões'],
          summary: 'Obter comissão por ID',
          description: 'Retorna dados detalhados de uma comissão específica',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID da comissão'
            }
          ],
          responses: {
            '200': {
              description: 'Dados da comissão'
            },
            '404': {
              description: 'Comissão não encontrada'
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        put: {
          tags: ['Comissões'],
          summary: 'Atualizar comissão',
          description: 'Atualiza dados de uma comissão existente',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID da comissão'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['PENDENTE', 'PAGA', 'CANCELADA'],
                      description: 'Novo status da comissão'
                    },
                    dataPagamento: {
                      type: 'string',
                      format: 'date-time',
                      description: 'Data de pagamento (obrigatório para status PAGA)'
                    },
                    observacoes: {
                      type: 'string',
                      description: 'Observações sobre a atualização'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Comissão atualizada com sucesso'
            },
            '404': {
              description: 'Comissão não encontrada'
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        delete: {
          tags: ['Comissões'],
          summary: 'Deletar comissão',
          description: 'Remove uma comissão do sistema (apenas se pendente)',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID da comissão'
            }
          ],
          responses: {
            '200': {
              description: 'Comissão deletada com sucesso'
            },
            '404': {
              description: 'Comissão não encontrada'
            },
            '400': {
              description: 'Comissão não pode ser deletada'
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/api/configuracoes': {
        get: {
          tags: ['Configurações'],
          summary: 'Listar configurações',
          description: 'Retorna lista paginada de configurações do sistema',
          security: [{ BearerAuth: [] }],
          parameters: [
            { $ref: '#/components/parameters/PageQuery' },
            { $ref: '#/components/parameters/LimitQuery' },
            { $ref: '#/components/parameters/SearchQuery' },
            {
              name: 'categoria',
              in: 'query',
              schema: { 
                type: 'string', 
                enum: ['SISTEMA', 'PAGAMENTO', 'EMAIL', 'SMS', 'COMISSAO', 'LIMITE'] 
              },
              description: 'Filtro por categoria da configuração'
            },
            {
              name: 'ativa',
              in: 'query',
              schema: { type: 'boolean' },
              description: 'Filtro por configurações ativas'
            }
          ],
          responses: {
            '200': {
              description: 'Lista de configurações',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PaginatedResponse' }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        post: {
          tags: ['Configurações'],
          summary: 'Criar nova configuração',
          description: 'Cria uma nova configuração no sistema',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    chave: {
                      type: 'string',
                      minLength: 1,
                      description: 'Chave única da configuração'
                    },
                    valor: {
                      type: 'string',
                      description: 'Valor da configuração'
                    },
                    tipo: {
                      type: 'string',
                      enum: ['STRING', 'NUMBER', 'BOOLEAN', 'JSON'],
                      description: 'Tipo do valor da configuração'
                    },
                    categoria: {
                      type: 'string',
                      enum: ['SISTEMA', 'PAGAMENTO', 'EMAIL', 'SMS', 'COMISSAO', 'LIMITE'],
                      description: 'Categoria da configuração'
                    },
                    descricao: {
                      type: 'string',
                      description: 'Descrição da configuração'
                    },
                    ativa: {
                      type: 'boolean',
                      default: true,
                      description: 'Se a configuração está ativa'
                    }
                  },
                  required: ['chave', 'valor', 'tipo', 'categoria']
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Configuração criada com sucesso'
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/api/configuracoes/{id}': {
        get: {
          tags: ['Configurações'],
          summary: 'Obter configuração por ID',
          description: 'Retorna dados de uma configuração específica',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID da configuração'
            }
          ],
          responses: {
            '200': {
              description: 'Dados da configuração'
            },
            '404': {
              description: 'Configuração não encontrada'
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        put: {
          tags: ['Configurações'],
          summary: 'Atualizar configuração',
          description: 'Atualiza dados de uma configuração existente',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID da configuração'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    valor: {
                      type: 'string',
                      description: 'Novo valor da configuração'
                    },
                    descricao: {
                      type: 'string',
                      description: 'Nova descrição da configuração'
                    },
                    ativa: {
                      type: 'boolean',
                      description: 'Se a configuração está ativa'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Configuração atualizada com sucesso'
            },
            '404': {
              description: 'Configuração não encontrada'
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        delete: {
          tags: ['Configurações'],
          summary: 'Deletar configuração',
          description: 'Remove uma configuração do sistema',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID da configuração'
            }
          ],
          responses: {
            '200': {
              description: 'Configuração deletada com sucesso'
            },
            '404': {
              description: 'Configuração não encontrada'
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/api/displays': {
        get: {
          tags: ['Displays'],
          summary: 'Listar displays',
          description: 'Retorna lista paginada de displays e equipamentos',
          security: [{ BearerAuth: [] }],
          parameters: [
            { $ref: '#/components/parameters/PageQuery' },
            { $ref: '#/components/parameters/LimitQuery' },
            { $ref: '#/components/parameters/SearchQuery' },
            {
              name: 'status',
              in: 'query',
              schema: { type: 'string', enum: ['ATIVO', 'INATIVO', 'MANUTENCAO'] },
              description: 'Filtro por status do display'
            },
            {
              name: 'tipo',
              in: 'query',
              schema: { type: 'string', enum: ['LED', 'LCD', 'PROJETOR', 'TOTEM'] },
              description: 'Filtro por tipo do display'
            },
            {
              name: 'estabelecimentoId',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filtro por ID do estabelecimento'
            }
          ],
          responses: {
            '200': {
              description: 'Lista de displays',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PaginatedResponse' }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        post: {
          tags: ['Displays'],
          summary: 'Criar novo display',
          description: 'Cria um novo display no sistema',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nome: {
                      type: 'string',
                      minLength: 2,
                      description: 'Nome identificador do display'
                    },
                    tipo: {
                      type: 'string',
                      enum: ['LED', 'LCD', 'PROJETOR', 'TOTEM'],
                      description: 'Tipo do display'
                    },
                    modelo: {
                      type: 'string',
                      description: 'Modelo do display'
                    },
                    resolucao: {
                      type: 'string',
                      description: 'Resolução do display (ex: 1920x1080)'
                    },
                    estabelecimentoId: {
                      type: 'string',
                      description: 'ID do estabelecimento'
                    },
                    localizacao: {
                      type: 'string',
                      description: 'Localização física do display'
                    },
                    configuracao: {
                      type: 'object',
                      description: 'Configurações específicas do display'
                    }
                  },
                  required: ['nome', 'tipo', 'estabelecimentoId']
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Display criado com sucesso'
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/api/displays/{id}': {
        get: {
          tags: ['Displays'],
          summary: 'Obter display por ID',
          description: 'Retorna dados de um display específico',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID do display'
            }
          ],
          responses: {
            '200': {
              description: 'Dados do display'
            },
            '404': {
              description: 'Display não encontrado'
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        put: {
          tags: ['Displays'],
          summary: 'Atualizar display',
          description: 'Atualiza dados de um display existente',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID do display'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nome: {
                      type: 'string',
                      description: 'Nome do display'
                    },
                    status: {
                      type: 'string',
                      enum: ['ATIVO', 'INATIVO', 'MANUTENCAO'],
                      description: 'Status do display'
                    },
                    localizacao: {
                      type: 'string',
                      description: 'Localização física do display'
                    },
                    configuracao: {
                      type: 'object',
                      description: 'Configurações do display'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Display atualizado com sucesso'
            },
            '404': {
              description: 'Display não encontrado'
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        delete: {
          tags: ['Displays'],
          summary: 'Deletar display',
          description: 'Remove um display do sistema',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID do display'
            }
          ],
          responses: {
            '200': {
              description: 'Display deletado com sucesso'
            },
            '404': {
              description: 'Display não encontrado'
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/api/solicitacoes': {
        get: {
          tags: ['Solicitações'],
          summary: 'Listar solicitações',
          description: 'Retorna lista paginada de solicitações e aprovações',
          security: [{ BearerAuth: [] }],
          parameters: [
            { $ref: '#/components/parameters/PageQuery' },
            { $ref: '#/components/parameters/LimitQuery' },
            { $ref: '#/components/parameters/SearchQuery' },
            {
              name: 'status',
              in: 'query',
              schema: { type: 'string', enum: ['PENDENTE', 'APROVADA', 'REJEITADA', 'CANCELADA'] },
              description: 'Filtro por status da solicitação'
            },
            {
              name: 'tipo',
              in: 'query',
              schema: { 
                type: 'string', 
                enum: ['REEMBOLSO', 'ESTORNO', 'ALTERACAO_LIMITE', 'NOVA_FUNCIONALIDADE', 'OUTROS'] 
              },
              description: 'Filtro por tipo da solicitação'
            },
            {
              name: 'solicitanteId',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filtro por ID do solicitante'
            },
            {
              name: 'prioridade',
              in: 'query',
              schema: { type: 'string', enum: ['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'] },
              description: 'Filtro por prioridade'
            }
          ],
          responses: {
            '200': {
              description: 'Lista de solicitações',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PaginatedResponse' }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        post: {
          tags: ['Solicitações'],
          summary: 'Criar nova solicitação',
          description: 'Cria uma nova solicitação no sistema',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tipo: {
                      type: 'string',
                      enum: ['REEMBOLSO', 'ESTORNO', 'ALTERACAO_LIMITE', 'NOVA_FUNCIONALIDADE', 'OUTROS'],
                      description: 'Tipo da solicitação'
                    },
                    titulo: {
                      type: 'string',
                      minLength: 5,
                      description: 'Título da solicitação'
                    },
                    descricao: {
                      type: 'string',
                      minLength: 10,
                      description: 'Descrição detalhada da solicitação'
                    },
                    prioridade: {
                      type: 'string',
                      enum: ['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'],
                      default: 'MEDIA',
                      description: 'Prioridade da solicitação'
                    },
                    valor: {
                      type: 'number',
                      minimum: 0,
                      description: 'Valor associado (para reembolsos/estornos)'
                    },
                    anexos: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'URLs dos anexos da solicitação'
                    },
                    dadosAdicionais: {
                      type: 'object',
                      description: 'Dados adicionais específicos do tipo de solicitação'
                    }
                  },
                  required: ['tipo', 'titulo', 'descricao']
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Solicitação criada com sucesso'
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/api/solicitacoes/{id}': {
        get: {
          tags: ['Solicitações'],
          summary: 'Obter solicitação por ID',
          description: 'Retorna dados completos de uma solicitação específica',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID da solicitação'
            }
          ],
          responses: {
            '200': {
              description: 'Dados da solicitação'
            },
            '404': {
              description: 'Solicitação não encontrada'
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        put: {
          tags: ['Solicitações'],
          summary: 'Atualizar solicitação',
          description: 'Atualiza dados de uma solicitação existente ou aprova/rejeita',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID da solicitação'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['PENDENTE', 'APROVADA', 'REJEITADA', 'CANCELADA'],
                      description: 'Novo status da solicitação'
                    },
                    observacoes: {
                      type: 'string',
                      description: 'Observações da análise/aprovação'
                    },
                    valorAprovado: {
                      type: 'number',
                      minimum: 0,
                      description: 'Valor aprovado (pode ser diferente do solicitado)'
                    },
                    dataResolucao: {
                      type: 'string',
                      format: 'date-time',
                      description: 'Data de resolução da solicitação'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Solicitação atualizada com sucesso'
            },
            '404': {
              description: 'Solicitação não encontrada'
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        delete: {
          tags: ['Solicitações'],
          summary: 'Deletar solicitação',
          description: 'Remove uma solicitação do sistema (apenas se pendente)',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID da solicitação'
            }
          ],
          responses: {
            '200': {
              description: 'Solicitação deletada com sucesso'
            },
            '404': {
              description: 'Solicitação não encontrada'
            },
            '400': {
              description: 'Solicitação não pode ser deletada'
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/api/relatorios': {
        get: {
          tags: ['Relatórios'],
          summary: 'Listar relatórios disponíveis',
          description: 'Retorna lista de relatórios disponíveis e seus metadados',
          security: [{ BearerAuth: [] }],
          parameters: [
            { $ref: '#/components/parameters/PageQuery' },
            { $ref: '#/components/parameters/LimitQuery' },
            {
              name: 'tipo',
              in: 'query',
              schema: { 
                type: 'string', 
                enum: ['TRANSACOES', 'COMISSOES', 'ESTABELECIMENTOS', 'CARTOES', 'FINANCEIRO', 'OPERACIONAL'] 
              },
              description: 'Filtro por tipo de relatório'
            },
            {
              name: 'periodo',
              in: 'query',
              schema: { type: 'string', enum: ['DIARIO', 'SEMANAL', 'MENSAL', 'ANUAL', 'PERSONALIZADO'] },
              description: 'Filtro por período do relatório'
            }
          ],
          responses: {
            '200': {
              description: 'Lista de relatórios disponíveis',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PaginatedResponse' }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        post: {
          tags: ['Relatórios'],
          summary: 'Gerar novo relatório',
          description: 'Gera um novo relatório baseado nos parâmetros fornecidos',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tipo: {
                      type: 'string',
                      enum: ['TRANSACOES', 'COMISSOES', 'ESTABELECIMENTOS', 'CARTOES', 'FINANCEIRO', 'OPERACIONAL'],
                      description: 'Tipo de relatório a ser gerado'
                    },
                    formato: {
                      type: 'string',
                      enum: ['PDF', 'EXCEL', 'CSV', 'JSON'],
                      default: 'PDF',
                      description: 'Formato de saída do relatório'
                    },
                    periodo: {
                      type: 'object',
                      properties: {
                        tipo: {
                          type: 'string',
                          enum: ['DIARIO', 'SEMANAL', 'MENSAL', 'ANUAL', 'PERSONALIZADO']
                        },
                        dataInicio: {
                          type: 'string',
                          format: 'date',
                          description: 'Data de início (obrigatório para período personalizado)'
                        },
                        dataFim: {
                          type: 'string',
                          format: 'date',
                          description: 'Data de fim (obrigatório para período personalizado)'
                        }
                      },
                      required: ['tipo']
                    },
                    filtros: {
                      type: 'object',
                      properties: {
                        franqueadoId: { type: 'string' },
                        estabelecimentoId: { type: 'string' },
                        status: { type: 'string' },
                        valorMinimo: { type: 'number' },
                        valorMaximo: { type: 'number' }
                      },
                      description: 'Filtros específicos do relatório'
                    },
                    configuracao: {
                      type: 'object',
                      properties: {
                        incluirGraficos: { type: 'boolean', default: true },
                        incluirDetalhes: { type: 'boolean', default: true },
                        agruparPor: { type: 'string', enum: ['DIA', 'SEMANA', 'MES', 'FRANQUEADO', 'ESTABELECIMENTO'] }
                      },
                      description: 'Configurações adicionais do relatório'
                    }
                  },
                  required: ['tipo', 'periodo']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Relatório gerado com sucesso',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      relatorio: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          url: { type: 'string' },
                          formato: { type: 'string' },
                          tamanho: { type: 'integer' },
                          dataGeracao: { type: 'string', format: 'date-time' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/api/relatorios/{id}': {
        get: {
          tags: ['Relatórios'],
          summary: 'Baixar relatório específico',
          description: 'Faz download de um relatório gerado anteriormente',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID do relatório'
            }
          ],
          responses: {
            '200': {
              description: 'Arquivo do relatório',
              content: {
                'application/pdf': {
                  schema: { type: 'string', format: 'binary' }
                },
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
                  schema: { type: 'string', format: 'binary' }
                },
                'text/csv': {
                  schema: { type: 'string' }
                },
                'application/json': {
                  schema: { type: 'object' }
                }
              }
            },
            '404': {
              description: 'Relatório não encontrado'
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        delete: {
          tags: ['Relatórios'],
          summary: 'Deletar relatório',
          description: 'Remove um relatório gerado do sistema',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID do relatório'
            }
          ],
          responses: {
            '200': {
              description: 'Relatório deletado com sucesso'
            },
            '404': {
              description: 'Relatório não encontrado'
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/api/logs': {
        get: {
          tags: ['Logs'],
          summary: 'Listar logs de auditoria',
          description: 'Retorna lista paginada de logs de auditoria do sistema',
          security: [{ BearerAuth: [] }],
          parameters: [
            { $ref: '#/components/parameters/PageQuery' },
            { $ref: '#/components/parameters/LimitQuery' },
            { $ref: '#/components/parameters/SearchQuery' },
            {
              name: 'nivel',
              in: 'query',
              schema: { type: 'string', enum: ['INFO', 'WARNING', 'ERROR', 'DEBUG'] },
              description: 'Filtro por nível do log'
            },
            {
              name: 'categoria',
              in: 'query',
              schema: { 
                type: 'string', 
                enum: ['AUTH', 'TRANSACAO', 'SISTEMA', 'USUARIO', 'API', 'DATABASE', 'SECURITY'] 
              },
              description: 'Filtro por categoria do log'
            },
            {
              name: 'usuarioId',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filtro por ID do usuário'
            },
            {
              name: 'dataInicio',
              in: 'query',
              schema: { type: 'string', format: 'date-time' },
              description: 'Data de início do filtro'
            },
            {
              name: 'dataFim',
              in: 'query',
              schema: { type: 'string', format: 'date-time' },
              description: 'Data de fim do filtro'
            },
            {
              name: 'ip',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filtro por endereço IP'
            }
          ],
          responses: {
            '200': {
              description: 'Lista de logs de auditoria',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/PaginatedResponse' },
                      {
                        type: 'object',
                        properties: {
                          stats: {
                            type: 'object',
                            properties: {
                              totalInfo: { type: 'integer' },
                              totalWarning: { type: 'integer' },
                              totalError: { type: 'integer' },
                              totalDebug: { type: 'integer' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        delete: {
          tags: ['Logs'],
          summary: 'Limpar logs antigos',
          description: 'Remove logs antigos do sistema baseado em critérios',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    diasParaManter: {
                      type: 'integer',
                      minimum: 1,
                      default: 90,
                      description: 'Número de dias para manter os logs'
                    },
                    nivel: {
                      type: 'array',
                      items: {
                        type: 'string',
                        enum: ['INFO', 'WARNING', 'ERROR', 'DEBUG']
                      },
                      description: 'Níveis específicos para limpar (opcional)'
                    },
                    categoria: {
                      type: 'array',
                      items: {
                        type: 'string',
                        enum: ['AUTH', 'TRANSACAO', 'SISTEMA', 'USUARIO', 'API', 'DATABASE', 'SECURITY']
                      },
                      description: 'Categorias específicas para limpar (opcional)'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Logs limpos com sucesso',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      removidos: { type: 'integer' }
                    }
                  }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/api/dashboard': {
        get: {
          tags: ['Dashboard'],
          summary: 'Obter métricas do dashboard',
          description: 'Retorna métricas e KPIs principais do sistema para dashboard',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'periodo',
              in: 'query',
              schema: { type: 'string', enum: ['hoje', '7dias', '30dias', '90dias', '1ano'] },
              default: '30dias',
              description: 'Período para cálculo das métricas'
            },
            {
              name: 'franqueadoId',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filtrar por franqueado específico (opcional)'
            }
          ],
          responses: {
            '200': {
              description: 'Métricas do dashboard',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      resumoFinanceiro: {
                        type: 'object',
                        properties: {
                          totalTransacoes: { type: 'number' },
                          volumeTransacoes: { type: 'integer' },
                          totalComissoes: { type: 'number' },
                          comissoesPendentes: { type: 'number' },
                          crescimentoTransacoes: { type: 'number' },
                          crescimentoComissoes: { type: 'number' }
                        }
                      },
                      estatisticasCartoes: {
                        type: 'object',
                        properties: {
                          cartoesAtivos: { type: 'integer' },
                          cartoesDisponiveis: { type: 'integer' },
                          cartoesUtilizados: { type: 'integer' },
                          cartoesExpirados: { type: 'integer' },
                          totalCartoes: { type: 'integer' }
                        }
                      },
                      metricas: {
                        type: 'object',
                        properties: {
                          totalFranqueados: { type: 'integer' },
                          franqueadosAtivos: { type: 'integer' },
                          totalEstabelecimentos: { type: 'integer' },
                          estabelecimentosAtivos: { type: 'integer' },
                          ticketMedio: { type: 'number' },
                          transacoesPorDia: { type: 'number' }
                        }
                      },
                      graficos: {
                        type: 'object',
                        properties: {
                          transacoesPorDia: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                data: { type: 'string', format: 'date' },
                                valor: { type: 'number' },
                                quantidade: { type: 'integer' }
                              }
                            }
                          },
                          comissoesPorMes: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                mes: { type: 'string' },
                                valor: { type: 'number' },
                                franqueados: { type: 'integer' }
                              }
                            }
                          },
                          topFranqueados: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                id: { type: 'string' },
                                nome: { type: 'string' },
                                transacoes: { type: 'integer' },
                                volume: { type: 'number' }
                              }
                            }
                          }
                        }
                      },
                      alertas: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            tipo: { type: 'string', enum: ['INFO', 'WARNING', 'ERROR'] },
                            titulo: { type: 'string' },
                            descricao: { type: 'string' },
                            data: { type: 'string', format: 'date-time' }
                          }
                        }
                      },
                      ultimaAtualizacao: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/api/estabelecimentos/stats': {
        get: {
          tags: ['Estabelecimentos'],
          summary: 'Obter estatísticas de estabelecimentos',
          description: 'Retorna estatísticas detalhadas dos estabelecimentos',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'periodo',
              in: 'query',
              schema: { type: 'string', enum: ['30dias', '90dias', '1ano'] },
              default: '30dias',
              description: 'Período para cálculo das estatísticas'
            }
          ],
          responses: {
            '200': {
              description: 'Estatísticas de estabelecimentos',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      totalEstabelecimentos: { type: 'integer' },
                      estabelecimentosAtivos: { type: 'integer' },
                      estabelecimentosInativos: { type: 'integer' },
                      distribuicaoPorCategoria: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            categoria: { type: 'string' },
                            quantidade: { type: 'integer' },
                            percentual: { type: 'number' }
                          }
                        }
                      },
                      performanceTop10: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            nome: { type: 'string' },
                            categoria: { type: 'string' },
                            transacoes: { type: 'integer' },
                            volume: { type: 'number' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/api/webhooks/asaas': {
        post: {
          tags: ['Webhooks'],
          summary: 'Webhook do Asaas para notificações de pagamento',
          description: 'Recebe notificações do Asaas sobre mudanças de status de pagamentos',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/WebhookAsaasEvent'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Webhook processado com sucesso',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      message: {
                        type: 'string',
                        example: 'Webhook processado com sucesso'
                      },
                      event: {
                        type: 'string',
                        example: 'PAYMENT_RECEIVED'
                      },
                      paymentId: {
                        type: 'string',
                        example: 'pay_123456789'
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Dados inválidos no webhook'
            },
            '401': {
              description: 'Assinatura do webhook inválida'
            },
            '500': {
              description: 'Erro interno do servidor'
            }
          }
        }
      },
      '/api/cobrancas': {
        get: {
          tags: ['Pagamentos'],
          summary: 'Listar cobranças',
          description: 'Lista todas as cobranças do sistema com filtros',
          security: [{ BearerAuth: [] }],
          parameters: [
            { $ref: '#/components/parameters/PageQuery' },
            { $ref: '#/components/parameters/LimitQuery' },
            { $ref: '#/components/parameters/SearchQuery' },
            {
              name: 'status',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['PENDING', 'PAID', 'EXPIRED', 'CANCELLED']
              },
              description: 'Filtro por status da cobrança'
            },
            {
              name: 'tipo',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['ATIVACAO_ESTABELECIMENTO', 'REPOSICAO_CARTOES']
              },
              description: 'Filtro por tipo da cobrança'
            }
          ],
          responses: {
            '200': {
              description: 'Lista de cobranças',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/PaginatedResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/CobrancaAsaas' }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/api/cobrancas/{id}': {
        get: {
          tags: ['Pagamentos'],
          summary: 'Obter cobrança por ID',
          description: 'Retorna dados detalhados de uma cobrança específica',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID da cobrança'
            }
          ],
          responses: {
            '200': {
              description: 'Dados da cobrança',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/CobrancaAsaas' },
                      {
                        type: 'object',
                        properties: {
                          estabelecimento: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              name: { type: 'string' },
                              cnpj: { type: 'string' }
                            }
                          },
                          franqueado: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              name: { type: 'string' },
                              region: { type: 'string' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            '404': {
              description: 'Cobrança não encontrada'
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        put: {
          tags: ['Pagamentos'],
          summary: 'Atualizar status da cobrança',
          description: 'Atualiza manualmente o status de uma cobrança (uso administrativo)',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID da cobrança'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['PENDING', 'PAID', 'EXPIRED', 'CANCELLED'],
                      description: 'Novo status da cobrança'
                    },
                    observacoes: {
                      type: 'string',
                      description: 'Observações sobre a alteração'
                    }
                  },
                  required: ['status']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Cobrança atualizada com sucesso',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/CobrancaAsaas'
                  }
                }
              }
            },
            '404': {
              description: 'Cobrança não encontrada'
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' }
          }
        },
        delete: {
          tags: ['Pagamentos'],
          summary: 'Cancelar cobrança',
          description: 'Cancela uma cobrança pendente no Asaas',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID da cobrança'
            }
          ],
          responses: {
            '200': {
              description: 'Cobrança cancelada com sucesso',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Cobrança cancelada com sucesso'
                      },
                      cobranca: {
                        $ref: '#/components/schemas/CobrancaAsaas'
                      }
                    }
                  }
                }
              }
            },
            '404': {
              description: 'Cobrança não encontrada'
            },
            '400': {
              description: 'Cobrança não pode ser cancelada (já paga ou expirada)'
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/api/estabelecimentos/{id}/payment-status': {
        get: {
          tags: ['Pagamentos'],
          summary: 'Obter status de pagamento do estabelecimento',
          description: 'Retorna informações sobre o status de pagamento da taxa de ativação',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID do estabelecimento'
            }
          ],
          responses: {
            '200': {
              description: 'Status de pagamento do estabelecimento',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      estabelecimento: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          status: { 
                            type: 'string',
                            enum: ['RASCUNHO', 'PENDENTE_PAGAMENTO', 'ATIVO', 'SUSPENSO', 'CANCELADO']
                          }
                        }
                      },
                      cobrancas: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/CobrancaAsaas'
                        }
                      },
                      resumo: {
                        type: 'object',
                        properties: {
                          totalPendente: { type: 'number' },
                          totalPago: { type: 'number' },
                          proximoVencimento: { 
                            type: 'string',
                            format: 'date-time',
                            nullable: true 
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '404': {
              description: 'Estabelecimento não encontrado'
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/api/pagamentos/estatisticas': {
        get: {
          tags: ['Pagamentos'],
          summary: 'Estatísticas de pagamentos',
          description: 'Retorna estatísticas gerais dos pagamentos do sistema',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'periodo',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['7d', '30d', '90d', '1y'],
                default: '30d'
              },
              description: 'Período para as estatísticas'
            },
            {
              name: 'franqueadoId',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filtro por franqueado específico'
            }
          ],
          responses: {
            '200': {
              description: 'Estatísticas de pagamentos',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      periodo: {
                        type: 'object',
                        properties: {
                          inicio: { type: 'string', format: 'date-time' },
                          fim: { type: 'string', format: 'date-time' }
                        }
                      },
                      totais: {
                        type: 'object',
                        properties: {
                          cobrancas: { type: 'number' },
                          valorTotal: { type: 'number' },
                          valorPago: { type: 'number' },
                          valorPendente: { type: 'number' },
                          taxaSucesso: { type: 'number' }
                        }
                      },
                      porStatus: {
                        type: 'object',
                        properties: {
                          PENDING: { type: 'number' },
                          PAID: { type: 'number' },
                          EXPIRED: { type: 'number' },
                          CANCELLED: { type: 'number' }
                        }
                      },
                      evolucao: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            data: { type: 'string', format: 'date' },
                            cobrancas: { type: 'number' },
                            valor: { type: 'number' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      }
    }
  },
  apis: [] // Array vazio mas necessário para o swaggerJsdoc
}

import type { OAS3Definition } from 'swagger-jsdoc';

export const getSwaggerSpec = () => {
  try {
    // Gerar especificação usando apenas swaggerJsdoc para evitar problemas no build
    const spec = swaggerJsdoc(options)
    return spec
  } catch (error) {
    console.error('Erro ao gerar especificação Swagger:', error)
    // Retornar especificação básica em caso de erro
    return options.definition
  }
}

export default swaggerJsdoc(options)
