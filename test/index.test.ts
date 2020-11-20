import Store from '@pedrouid/iso-store';
import { JsonRpcSigner } from 'rpc-json-signer';
import { JsonRpcRequest } from 'rpc-json-utils';
import {
  IJsonRpcAuthenticator,
  ISigner,
  JsonRpcAuthenticator,
  JsonRpcAuthenticatorConfig,
  JsonSchema,
} from '../src';

const ETHEREUM_CHAIN_ID = 'eip155:1';

const ETHEREUM_TX_JSONRPC_SCHEMA: JsonSchema = {
  type: 'object',
  properties: {
    from: { type: 'string', required: true },
    to: { type: 'string' },
    gas: { type: 'string' },
    gasPrice: { type: 'string' },
    value: { type: 'string' },
    data: { type: 'string' },
    nonce: { type: 'string' },
  },
};

const ETHEREUM_SIGNER_JSONRPC_CONFIG: JsonRpcAuthenticatorConfig = {
  context: ETHEREUM_CHAIN_ID,
  methods: {
    eth_sendTransaction: {
      name: 'eth_sendTransaction',
      description: 'Creates, signs, and sends a new transaction to the network',
      params: {
        type: 'array',
        items: ETHEREUM_TX_JSONRPC_SCHEMA,
      },
      result: {
        type: 'string',
      },
      userApproval: true,
    },
  },
};

const TEST_JSON_RPC_REQUEST: { [method: string]: JsonRpcRequest } = {
  eth_sendTransaction: {
    id: 1,
    jsonrpc: '2.0',
    method: 'eth_sendTransaction',
    params: [
      {
        data:
          '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
        from: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
        gas: '0x76c0',
        gasPrice: '0x9184e72a000',
        to: '0xd46e8dd67c5d32be8058bb8eb970870f07244567',
        value: '0x9184e72a',
      },
    ],
  },
  invalid_method: {
    id: 1,
    jsonrpc: '2.0',
    method: 'invalid_method',
    params: [],
  },
};

describe('JsonRpcAuthenticator', () => {
  let ethereumAuthenticator: IJsonRpcAuthenticator;
  beforeAll(() => {
    const signer = new JsonRpcSigner('https://api.mycryptoapi.com/eth');
    const store = new Store();
    ethereumAuthenticator = new JsonRpcAuthenticator(
      ETHEREUM_SIGNER_JSONRPC_CONFIG,
      signer,
      store
    );
  });
  it('init', async () => {
    expect(ethereumAuthenticator).toBeTruthy();
  });
  it('supportsMethod', async () => {
    expect(
      ethereumAuthenticator.supportsMethod(
        TEST_JSON_RPC_REQUEST.eth_sendTransaction
      )
    ).toBeTruthy();
    expect(
      ethereumAuthenticator.supportsMethod(TEST_JSON_RPC_REQUEST.invalid_method)
    ).toBeFalsy();
  });
  it('requiresApproval', async () => {
    expect(
      ethereumAuthenticator.requiresApproval(
        TEST_JSON_RPC_REQUEST.eth_sendTransaction
      )
    ).toBeTruthy();
    expect(() =>
      ethereumAuthenticator.requiresApproval(
        TEST_JSON_RPC_REQUEST.invalid_method
      )
    ).toThrow(`JSON-RPC method not supported: invalid_method`);
  });
  it('validateRequest', async () => {
    expect(
      ethereumAuthenticator.validateRequest(
        TEST_JSON_RPC_REQUEST.eth_sendTransaction
      )
    ).toBeTruthy();
    expect(() =>
      ethereumAuthenticator.validateRequest(
        TEST_JSON_RPC_REQUEST.invalid_method
      )
    ).toThrow(`JSON-RPC method not supported: invalid_method`);
  });
});
