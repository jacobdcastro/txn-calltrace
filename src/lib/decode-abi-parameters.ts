import { AbiParameter } from "abitype";
import { decodeAbiParameters } from "viem";

// TODO figure out how to handle tuple types better, for now just return the raw bytes 

function formatAbiParameterValue(param: AbiParameter, value: any): any {
  // handle tuple types
  if (param.type === 'tuple' || param.type.startsWith('tuple[')) {
    // typescript: type guard to narrow the param type and ensure components exist
    const components = 'components' in param ? param.components : undefined;
    if (!components) return value;

    // handle array of tuples
    if (param.type.includes('[]')) {
      return value.map((item: any) =>
        // if tuple has a name, wrap the decoded components in an object with that name
        param.name
          ? { [param.name]: formatTupleComponents(components, item) }
          : formatTupleComponents(components, item)
      );
    }

    // handle single tuple
    return param.name
      ? { [param.name]: formatTupleComponents(components, value) }
      : formatTupleComponents(components, value);
  }

  // return unchanged value for other types
  return value;
}

// helper function to format tuple components
function formatTupleComponents(components: readonly AbiParameter[], value: any): Record<string, any> {
  return components.reduce((acc: Record<string, any>, component: AbiParameter, index: number) => {
    const name = component.name || `param${index}`;
    acc[name] = formatAbiParameterValue(component, value[index]);
    return acc;
  }, {});
}

// typescript: mark params as readonly to match AbiParameter type definition
// this ensures we can accept both mutable and immutable parameter arrays
export function decodeAbiParametersEnhanced(params: readonly AbiParameter[], data: `0x${string}` | undefined): any[] {
  if (!data) return [];

  try {
    // Only slice if the data includes a function selector (length > 10)
    const inputData = data.length > 10
      ? `0x${data.slice(10)}` as `0x${string}`
      : data;

    // decode using viem's decoder
    const decodedValues = decodeAbiParameters(params, inputData);

    // format each parameter value
    return params.map((param, index) =>
      formatAbiParameterValue(param, decodedValues[index])
    );
  } catch (error) {
    console.warn('failed to decode abi parameters:', error);
    // Return an array of nulls instead of empty array to maintain parameter positions
    return Array(params.length).fill(null);
  }
} 