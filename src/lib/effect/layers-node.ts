import { NodeHttpClient } from "@effect/platform-node";
import { withHttp } from "./layers";

export const AppLiveNode = withHttp(NodeHttpClient.layer);
