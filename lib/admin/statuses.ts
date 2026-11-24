// 名單狀態。contacted 之後代表已有人工接手，自動跟進信會停止。
export const LEAD_STATUSES = ["new", "contacted", "qualified", "converted", "lost"] as const;
