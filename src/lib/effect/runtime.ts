import { ManagedRuntime } from "effect";
import { AppLive } from "./layers";

export const AppRuntime = ManagedRuntime.make(AppLive);

export const runAppEffect = AppRuntime.runPromise;
