export const getAvatarColor = (name) => ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"][((name||"").charCodeAt(0)||0) % 5];
