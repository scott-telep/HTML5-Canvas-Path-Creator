export type SimulateFn = (cmds: any[]) => void;

export interface Simulator {
  simulate:SimulateFn
}