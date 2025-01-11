import { decodeAbiParametersEnhanced } from '@/lib/decode-abi-parameters';
import { serializeBigInts } from '@/lib/serialize-bigints';
import { AbiParameter } from 'abitype';

describe('decodeAbiParametersEnhanced', () => {
  it('should decode common parameter types correctly', () => {
    const params: readonly AbiParameter[] = [
      { name: 'amount', type: 'uint256' },
      { name: 'recipient', type: 'address' },
      { name: 'active', type: 'bool' },
      { name: 'hash', type: 'bytes32' }
    ];

    const data = '0x' +
      '11223344' + // function selector
      '000000000000000000000000000000000000000000000000000000000000007b' + // uint256: 123
      '000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045' + // address
      '0000000000000000000000000000000000000000000000000000000000000001' + // bool: true
      '0000000000000000000000000000000000000000000000000000000000000123'; // bytes32

    const result = decodeAbiParametersEnhanced(params, data as `0x${string}`);
    const serializedResult = serializeBigInts(result);

    // convert to lowercase to handle checksum mismatch issues
    serializedResult[1] = serializedResult[1].toLowerCase();

    expect(serializedResult).toEqual([
      "123", // uint256
      '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'.toLowerCase(), // address
      true, // bool
      '0x0000000000000000000000000000000000000000000000000000000000000123' // bytes32
    ]);
  });

  it('should handle empty input data', () => {
    const params: readonly AbiParameter[] = [
      { name: 'amount', type: 'uint256' }
    ];

    const result = decodeAbiParametersEnhanced(params, undefined);
    expect(result).toEqual([]);
  });

  it('should handle decoding errors gracefully', () => {
    const params: readonly AbiParameter[] = [
      { name: 'amount', type: 'uint256' }
    ];

    const data = '0xinvalid';

    const result = decodeAbiParametersEnhanced(params, data as `0x${string}`);
    expect(result).toEqual([null]);
  });
});
