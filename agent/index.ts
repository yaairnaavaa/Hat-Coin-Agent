import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { ContractCallArgs, ChangeOwner, ClaimVault, FtOnTransfer, GetListDeposits, GetVaults, GetLastVault, GetGreeting } from './contract_types';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

interface FunctionCallAction {
  type: "FunctionCall";
  params: {
    methodName: string;
    args: object;
    gas: string;
    deposit: string;
  };
}

const CONTRACT_ID = "surgedev.near";
const CONTRACT_ID_VAULT = "vault.hat-coin.near";
const ACCOUNT_ID = "yairnava777.near";

app.post('/api/change_owner', (req: Request, res: Response) => {
  const { new_owner_id } = req.body as ChangeOwner;

  if (!new_owner_id) {
    return res.status(400).json({ error: "new_owner_id is required" });
  }

  const functionCall: FunctionCallAction = {
    type: "FunctionCall",
    params: {
      methodName: "change_owner",
      args: { new_owner_id },
      gas: "30000000000000",
      deposit: "0"
    }
  };

  return res.json(functionCall);
});

app.post('/api/get_greeting', async (req: Request, res: Response) => {
  const functionCall: FunctionCallAction = {
    type: "FunctionCall",
    params: {
      methodName: "get_greeting",
      args: {},
      gas: "10000000000000",
      deposit: "0"
    }
  };

  const response = await fetch("https://rpc.mainnet.near.org", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "dontcare",
      method: "query",
      params: {
        request_type: "call_function",
        finality: "final",
        account_id: CONTRACT_ID,
        method_name: "get_greeting",
        args_base64: Buffer.from(JSON.stringify({})).toString('base64')
      }
    })
  });

  const data = await response.json();
  let deserializedResult;

  if (Array.isArray(data.result.result)) {
    deserializedResult = String.fromCharCode(...data.result.result);
  } else {
    deserializedResult = data.result.result;
  }

  return res.json(deserializedResult);
});

app.post('/api/claim_vault', (req: Request, res: Response) => {
  const { index } = req.body as ClaimVault;

  if (typeof index !== 'number') {
    return res.status(400).json({ error: "index must be a number" });
  }

  const functionCall: FunctionCallAction = {
    type: "FunctionCall",
    params: {
      methodName: "claim_vault",
      args: { index },
      gas: "30000000000000",
      deposit: "0"
    }
  };

  return res.json(functionCall);
});

app.post('/api/ft_on_transfer', (req: Request, res: Response) => {
  const { sender_id, amount, msg } = req.body as FtOnTransfer;

  if (!sender_id || !amount || !msg) {
    return res.status(400).json({ error: "sender_id, amount, and msg are required" });
  }

  const functionCall: FunctionCallAction = {
    type: "FunctionCall",
    params: {
      methodName: "ft_on_transfer",
      args: { sender_id, amount, msg },
      gas: "30000000000000",
      deposit: "0"
    }
  };

  return res.json(functionCall);
});

app.post('/api/get_list_deposits', (req: Request, res: Response) => {
  const { from_index, limit } = req.body as GetListDeposits;

  if (typeof from_index !== 'number' || typeof limit !== 'number') {
    return res.status(400).json({ error: "from_index and limit must be numbers" });
  }

  const functionCall: FunctionCallAction = {
    type: "FunctionCall",
    params: {
      methodName: "get_list_deposits",
      args: { from_index, limit },
      gas: "30000000000000",
      deposit: "0"
    }
  };

  return res.json(functionCall);
});

app.post('/api/get_vaults', async (req: Request, res: Response) => {
  const { start_index, limit } = req.body as GetVaults;

  // Validación de los parámetros
  if (typeof start_index !== 'number' || typeof limit !== 'number') {
    return res.status(400).json({ error: "start_index and limit must be numbers" });
  }

  // Crear el objeto FunctionCallAction
  const functionCall: FunctionCallAction = {
    type: "FunctionCall",
    params: {
      methodName: "get_vaults",
      args: { start_index, limit },
      gas: "30000000000000", // Ajusta el gas según sea necesario
      deposit: "0"
    }
  };

    // Llamada RPC al contrato inteligente para obtener los vaults
    const response = await fetch("https://rpc.mainnet.near.org", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "dontcare",
        method: "query",
        params: {
          request_type: "call_function",
          finality: "final",
          account_id: CONTRACT_ID_VAULT, // Asegúrate de tener este valor definido
          method_name: "get_vaults",
          args_base64: Buffer.from(JSON.stringify({ start_index, limit })).toString('base64')
        }
      })
    });

    // Procesar la respuesta
    const data = await response.json();
    let deserializedResult;

    if (Array.isArray(data.result.result)) {
      // Si el resultado es un array de bytes, lo convertimos a string
      deserializedResult = String.fromCharCode(...data.result.result);
    } else {
      // Si no es un array, directamente asignamos el resultado
      deserializedResult = data.result.result;
    }

    // Enviar la respuesta al cliente
    return res.json(deserializedResult);
});

app.post('/api/get_last_vault', async (req: Request, res: Response) => {
  const functionCall: FunctionCallAction = {
    type: "FunctionCall",
    params: {
      methodName: "get_last_vault",
      args: {},
      gas: "10000000000000",
      deposit: "0"
    }
  };

  const response = await fetch("https://rpc.mainnet.near.org", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "dontcare",
      method: "query",
      params: {
        request_type: "call_function",
        finality: "final",
        account_id: CONTRACT_ID_VAULT,
        method_name: "get_last_vault",
        args_base64: Buffer.from(JSON.stringify({})).toString('base64')
      }
    })
  });

  const data = await response.json();
  let deserializedResult;

  if (Array.isArray(data.result.result)) {
    deserializedResult = String.fromCharCode(...data.result.result);
  } else {
    deserializedResult = data.result.result;
  }

  return res.json(deserializedResult);
});

app.get('/api/ping', (req: Request, res: Response) => {
  res.json({ message: "pong" });
});

app.get('/.well-known/ai-plugin.json', (req: Request, res: Response) => {
  dotenv.config();
  const url = JSON.parse(process.env.BITTE_CONFIG || '{}').url;

  const openApiSpec = {
    openapi: "3.0.0",
    info: {
      title: "Diamond Vault Assistant",
      description: "You are an assistant designed to interact with the vault.hat-coin.near contract on the Near Protocol. Your main functions are:\n\n1. Use the /api/change_owner, /api/claim_vault, /api/ft_on_transfer, /api/get_list_deposits, and /api/get_vaults endpoints to perform write operations. These endpoints will return valid function calls which you should be able to send. Ensure all required parameters are provided by the user as described in the paths section below.\n\n2. Use the /api/[function_name] endpoints to retrieve data from the contract.\n\nWhen performing write operations:\n- Ensure all required parameters are non-empty and of the correct type.\n- Avoid using any special characters or formatting that might cause issues with the contract.\n- If the user provides invalid input, kindly ask them to provide valid data according to the parameter specifications.\n\nWhen performing view operations:\n- Simply use the appropriate /api/[function_name] endpoint and return the result to the user.\n\nImportant: For all write operations, the endpoints will return a function call object. You should clearly indicate to the user that this is a function call that needs to be sent to the blockchain, and not the final result of the operation.",
      version: "1.0.0"
    },
    servers: [
      {
        url: url
      }
    ],
    "x-mb": {
      "account-id": ACCOUNT_ID,
      "assistant": {
        "name": "Hat Coin Assistant",
        "description": "An assistant for interacting with Hat Coin contracts on NEAR.",
        "instructions": "You are an assistant designed to interact with the vault.hat-coin.near, auction.hat-coin.near and hat-coin.near contracts on the Near Protocol. Your main functions are:\n\n1. Use the /api/change_owner, /api/claim_vault, /api/ft_on_transfer, /api/get_list_deposits, and /api/get_vaults endpoints to perform write operations. These endpoints will return valid function calls which you should be able to send. Ensure all required parameters are provided by the user as described in the paths section below.\n\n2. Use the /api/[function_name] endpoints to retrieve data from the contract.\n\nWhen performing write operations:\n- Ensure all required parameters are non-empty and of the correct type.\n- Avoid using any special characters or formatting that might cause issues with the contract.\n- If the user provides invalid input, kindly ask them to provide valid data according to the parameter specifications.\n\nWhen performing view operations:\n- Simply use the appropriate /api/[function_name] endpoint and return the result to the user.\n\nImportant: For all write operations, the endpoints will return a function call object. You should clearly indicate to the user that this is a function call that needs to be sent to the blockchain, and not the final result of the operation.",
        "tools": [{
          "type": "generate-transaction"
        }]
      }
    },
    paths: {
      "/api/get_last_vault": {
        "post": {
          "tags": ["Vault"],
          "summary": "Get the last vault",
          "description": "This endpoint allows you to retrieve the most recent vault from the contract.",
          "operationId": "get-last-vault",
          "responses": {
            "200": {
              "description": "Successful response",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "type": {
                        "type": "string",
                        "enum": ["FunctionCall"]
                      },
                      "params": {
                        "type": "object",
                        "properties": {
                          "methodName": {
                            "type": "string"
                          },
                          "args": {
                            "type": "object"
                          },
                          "gas": {
                            "type": "string"
                          },
                          "deposit": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/change_owner": {
        post: {
          tags: ["Owner"],
          summary: "Change the owner of the vault",
          description: "This endpoint allows you to change the owner of the vault. Provide the new owner's account ID.",
          operationId: "change-owner",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    new_owner_id: {
                      type: "string",
                      format: "account-id"
                    }
                  },
                  required: ["new_owner_id"]
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      type: {
                        type: "string",
                        enum: ["FunctionCall"]
                      },
                      params: {
                        type: "object",
                        properties: {
                          methodName: {
                            type: "string"
                          },
                          args: {
                            type: "object",
                            properties: {
                              new_owner_id: {
                                type: "string"
                              }
                            }
                          },
                          gas: {
                            type: "string"
                          },
                          deposit: {
                            type: "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/claim_vault": {
        post: {
          tags: ["Vault"],
          summary: "Claim a vault",
          description: "This endpoint allows you to claim a vault by providing the index of the vault.",
          operationId: "claim-vault",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    index: {
                      type: "integer"
                    }
                  },
                  required: ["index"]
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      type: {
                        type: "string",
                        enum: ["FunctionCall"]
                      },
                      params: {
                        type: "object",
                        properties: {
                          methodName: {
                            type: "string"
                          },
                          args: {
                            type: "object",
                            properties: {
                              index: {
                                type: "integer"
                              }
                            }
                          },
                          gas: {
                            type: "string"
                          },
                          deposit: {
                            type: "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/ft_on_transfer": {
        post: {
          tags: ["Transfer"],
          summary: "Handle FT transfer",
          description: "This endpoint allows you to handle a fungible token transfer by providing the sender ID, amount, and message.",
          operationId: "ft-on-transfer",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    sender_id: {
                      type: "string",
                      format: "account-id"
                    },
                    amount: {
                      type: "string"
                    },
                    msg: {
                      type: "string"
                    }
                  },
                  required: ["sender_id", "amount", "msg"]
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      type: {
                        type: "string",
                        enum: ["FunctionCall"]
                      },
                      params: {
                        type: "object",
                        properties: {
                          methodName: {
                            type: "string"
                          },
                          args: {
                            type: "object",
                            properties: {
                              sender_id: {
                                type: "string"
                              },
                              amount: {
                                type: "string"
                              },
                              msg: {
                                type: "string"
                              }
                            }
                          },
                          gas: {
                            type: "string"
                          },
                          deposit: {
                            type: "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/get_list_deposits": {
        post: {
          tags: ["Deposits"],
          summary: "Get list of deposits",
          description: "This endpoint allows you to retrieve a list of deposits by providing the from index and limit.",
          operationId: "get-list-deposits",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    from_index: {
                      type: "integer"
                    },
                    limit: {
                      type: "integer"
                    }
                  },
                  required: ["from_index", "limit"]
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      type: {
                        type: "string",
                        enum: ["FunctionCall"]
                      },
                      params: {
                        type: "object",
                        properties: {
                          methodName: {
                            type: "string"
                          },
                          args: {
                            type: "object",
                            properties: {
                              from_index: {
                                type: "integer"
                              },
                              limit: {
                                type: "integer"
                              }
                            }
                          },
                          gas: {
                            type: "string"
                          },
                          deposit: {
                            type: "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/get_vaults": {
        post: {
          tags: ["Vaults"],
          summary: "Get vaults",
          description: "This endpoint allows you to retrieve vaults by providing the start index and limit.",
          operationId: "get-vaults",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    start_index: {
                      type: "integer"
                    },
                    limit: {
                      type: "integer"
                    }
                  },
                  required: ["start_index", "limit"]
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      type: {
                        type: "string",
                        enum: ["FunctionCall"]
                      },
                      params: {
                        type: "object",
                        properties: {
                          methodName: {
                            type: "string"
                          },
                          args: {
                            type: "object",
                            properties: {
                              start_index: {
                                type: "integer"
                              },
                              limit: {
                                type: "integer"
                              }
                            }
                          },
                          gas: {
                            type: "string"
                          },
                          deposit: {
                            type: "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/get_greeting": {
        post: {
          tags: ["Greeting"],
          summary: "Get the current greeting",
          description: "This endpoint retrieves the current greeting from the contract.",
          operationId: "get-greeting",
          responses: {
            "200": {
              description: "Successful response with the current greeting",
              content: {
                "application/json": {
                  schema: {
                    type: "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  res.json(openApiSpec);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});