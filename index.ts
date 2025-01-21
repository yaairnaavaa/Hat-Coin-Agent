import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { ContractCallArgs, GetGreeting, SetGreeting } from './contract_types';

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
const ACCOUNT_ID = "yairnava777.near";

app.post('/api/set_greeting', (req: Request, res: Response) => {
  const { greeting } = req.body as SetGreeting;

  if (typeof greeting !== 'string' || greeting.trim() === '') {
    return res.status(400).json({ error: 'Invalid greeting provided.' });
  }

  const functionCall: FunctionCallAction = {
    type: "FunctionCall",
    params: {
      methodName: "set_greeting",
      args: { greeting },
      gas: "10000000000000",
      deposit: "1"
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

app.get('/ping', (req: Request, res: Response) => {
  res.json({ message: 'pong' });
});

app.get('/.well-known/ai-plugin.json', (req: Request, res: Response) => {
  dotenv.config();
  const url = JSON.parse(process.env.BITTE_CONFIG || '{}').url;

  const openApiSpec = {
    openapi: "3.0.0",
    info: {
      title: "Greeting Contract API",
      description: "This API allows interaction with the greeting contract on the Near Protocol.",
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
        "name": "Greeting Assistant",
        "description": "An assistant designed to interact with the greeting contract on the Near Protocol.",
        "instructions": "You are an assistant designed to interact with the surgedev.near contract on the Near Protocol. Your main functions are:\n\n1. [Set Greeting]: Use the /api/set_greeting endpoint to set a new greeting. Ensure the 'greeting' parameter is provided and is a non-empty string.\n\n2. [Get Greeting]: Use the /api/get_greeting endpoint to retrieve the current greeting.\n\nWhen performing write operations:\n- Ensure all required parameters are non-empty and of the correct type.\n- Avoid using any special characters or formatting that might cause issues with the contract.\n- If the user provides invalid input, kindly ask them to provide valid data according to the parameter specifications.\n\nWhen performing view operations:\n- Simply use the appropriate /api/[function_name] endpoint and return the result to the user.\n\nImportant: For all write operations, the endpoints will return a function call object. You should clearly indicate to the user that this is a function call that needs to be sent to the blockchain, and not the final result of the operation.",
        "tools": [{
          "type": "generate-transaction"
        }]
      }
    },
    paths: {
      "/api/set_greeting": {
        post: {
          tags: ["Greeting"],
          summary: "Set a new greeting",
          description: "This endpoint allows you to set a new greeting. Provide a non-empty string as the greeting.",
          operationId: "set-greeting",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    greeting: {
                      type: "string"
                    }
                  },
                  required: ["greeting"]
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Successful function call object",
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
                              greeting: {
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
      },
      "/ping": {
        get: {
          tags: ["Ping"],
          summary: "Ping the server",
          description: "This endpoint returns a simple 'pong' message.",
          operationId: "ping",
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
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
  };

  res.json(openApiSpec);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});