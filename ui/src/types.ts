export type AgentPubKey = string;
export type HeaderHash = string;

export interface Invitation{
    inviter: AgentPubKey,
    invited: AgentPubKey,
    timestamp: any    
}

export type Dictionary<T> = { [key: string]: T };