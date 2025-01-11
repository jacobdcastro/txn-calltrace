import { enhanceCallTraceWithVerifiedSource } from '@/lib/enhance-call';
import { Call } from '@/lib/get-txn-calltrace';
import { getVerifiedContract } from '@/lib/get-verified-contract';
import { serializeBigInts } from '@/lib/serialize-bigints';

// Mock the getVerifiedContract function
jest.mock('@/lib/get-verified-contract');
const mockGetVerifiedContract = getVerifiedContract as jest.MockedFunction<typeof getVerifiedContract>;

describe('enhanceCallTraceWithVerifiedSource', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should enhance a call trace with verified contract data', async () => {
    const mockCall: Call = {
      from: '0x123',
      to: '0x456',
      input: '0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000000000000000000000000000000000000000007b',
      type: 'CALL'
    };

    // Mock the verified contract response
    mockGetVerifiedContract.mockResolvedValueOnce({
      ContractName: 'TestToken',
      ABI: JSON.stringify([{
        type: 'function',
        name: 'transfer',
        inputs: [
          { name: 'recipient', type: 'address' },
          { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'nonpayable'
      }]),
    } as any);

    const result = await enhanceCallTraceWithVerifiedSource(mockCall);
    const serializedResult = serializeBigInts(result);

    expect(serializedResult.contractName).toBe('TestToken');
    expect(serializedResult.functionName).toBe('transfer');

    // testValue hardcoded here to avoid checksum mismatch issues
    const testValue = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    expect(serializedResult.decodedInputParams).toEqual([
      testValue, "123"
    ]);
  });

  it('should handle unverified contracts gracefully', async () => {
    const mockCall: Call = {
      from: '0x123',
      to: '0x456',
      input: '0x',
      type: 'CALL'
    };

    mockGetVerifiedContract.mockRejectedValueOnce(new Error('Contract not verified'));

    const result = await enhanceCallTraceWithVerifiedSource(mockCall);

    expect(result.contractName).toBeUndefined();
    expect(result.functionName).toBeUndefined();
    expect(result.decodedInputParams).toBeUndefined();
  });

  it('should process nested calls recursively', async () => {
    const mockCall: Call = {
      from: '0x123',
      to: '0x456',
      type: 'CALL',
      calls: [{
        from: '0x456',
        to: '0x789',
        type: 'DELEGATECALL'
      }]
    };

    mockGetVerifiedContract.mockResolvedValueOnce({
      ContractName: 'Parent',
      ABI: '[]'
    } as any);

    mockGetVerifiedContract.mockResolvedValueOnce({
      ContractName: 'Child',
      ABI: '[]'
    } as any);

    const result = await enhanceCallTraceWithVerifiedSource(mockCall);

    expect(result.contractName).toBe('Parent');
    expect(result.calls?.[0].contractName).toBe('Child');
  });
});