import { supabase } from "./supabase";

export interface RpcResult {
  success: boolean;
  error?: string;
  id?: string;
}

export async function rpc<T>(name: string, params?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(name, params);
  if (error) throw error;
  return data as T;
}
