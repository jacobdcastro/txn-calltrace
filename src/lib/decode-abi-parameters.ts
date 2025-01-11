import { AbiParameter } from "abitype";
import { decodeAbiParameters } from "viem";

// TODO figure out how to handle tuple types better

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
    // decode using viem's decoder
    const decodedValues = decodeAbiParameters(params, data);

    // format each parameter value
    return params.map((param, index) =>
      formatAbiParameterValue(param, decodedValues[index])
    );
  } catch (error) {
    console.warn('failed to decode abi parameters:', error);
    return [];
  }
} 