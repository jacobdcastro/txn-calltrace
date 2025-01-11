# txn-calltrace

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Documentation

### Stack

- [Next.js](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Viem](https://viem.sh)
- [React Query](https://tanstack.com/query)
- [Jest](https://jestjs.io)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [TypeScript](https://www.typescriptlang.org)

### Goal

The goal of this project is to create a simple UI for viewing a transaction's call trace, decoded input/output parameters, and any other relevant data.

### Approach

There are two data sources used in the app:

- [Quicknode](https://www.quicknode.com)
- [Etherscan](https://etherscan.io)

The following the order of events for how the data is fetched, processed, and displayed:

1. After being given a transaction hash, the first step was to get the transaction's receipt from the Quicknode `eth_getTransactionReceipt` RPC method to ensure the transaction exists.

2. If the transaction exists, the next step was to get the transaction's call trace from the Quicknode API with the `debug_traceTransaction` RPC method. This RPC method returns a recursive `Call` object that contains the transaction's call trace, as defined by the `interface Call` in `src/lib/get-txn-calltrace.ts`.

3. This call trace object is then mutated (or enhanced) to include additional fields that are fetched by the `getVerifiedContract` function in `src/lib/get-verified-contract.ts`. For each `Call` object, the `to` field is used as the contract address to the Etherscan API. And if that contract is verified, the additional fields are added to the `Call` object.

4. The additional fields not only includes the contract's name or the call's revert message, but also the decoded input and output parameters. This is done by using the fetched ABI from the Etherscan API and using the `decodeInput` and `decodeOutput` functions in `src/lib/decode-params.ts`. Decode logic is done using the helper functions from the `viem` library.

(note: steps 2-4 are done on the server-side with Next.js API routes). 

5. The API route returns the `EnhancedCall` object data in a form that is ready to be displayed by the frontend. The frontend then uses this data to render the transaction's call trace, decoded input/output parameters, and any other relevant data.

### React

The React components I built for this UI are compositional abstractions built on top of shadcn's atomic building blocks. Shadcn components are prebuilt with necessary functionality, accessibility, and customization. Using these components, I was able to build the UI with a focus on the user experience and speed (the most important value on this project).

For data handling within components, I used React Query to fetch and cache data. I wrote custom hooks, such as `useGetTransactionReceipt` as wrappers around React Query's `useQuery` hook to fetch data efficiently, use the cache, and handle loading, error, and success states.

#### UI

I chose the tailwindcss, next.js, shadcn, and viem stack for this project because it's the stack I am most familiar with and can move fast on.

The most complicated UI component to develop was the `CallTrace` component. This component is responsible for rendering the transaction's call trace in a tree-like structure. It features a recursive and collapsible design for easy navigation and readability. Each `CallNode` is also clickable to show/hide the decoded input/output parameters for that particular function call.

There is some obvious data missing (such as `value`, `gas paid`, etc.) but decided to focus on the `CallTrace` and `Input/Output` components for this project.

### Testing

I wrote simple unit tests for the most important and tedious functionality in the app: parameter decoding and `Call` object enhancement. I used Jest and React Testing Library to write these tests.

There are tons of other edge cases and scenarios that could/should be tested, but I focused on the most important ones for this project.

## Considerations

Due to time constraints, I had to make some trade-offs and decisions that I would like to address:

- Tuple types: after realizing that gracefully decoding and displaying tuple types would increase scope, I decided to only display tuples as bytes and/or empty objects. I handled all other types.
- Data Fetching Optimization: The API route handler responsible for building the `EnhancedCall` object could be optimized in a few ways. First, we could fetch data from Etherscan in parallel rather than sequentially (given a paid Etherscan API key). Second, we could cache the fetched verified contract data to avoid redundant calls to the Etherscan API. I would cache both locally (state within function scope) and globally (using Redis).
