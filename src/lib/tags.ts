export type TagOption = {
  id: number;
  nome: string;
};

function normalizeTagName(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

export function getUniqueTags<T extends TagOption>(tags: T[]) {
  const uniqueTags = new Map<string, T>();

  for (const tag of tags) {
    const key = normalizeTagName(tag.nome);
    const existing = uniqueTags.get(key);

    if (!existing || tag.id < existing.id) {
      uniqueTags.set(key, tag);
    }
  }

  return [...uniqueTags.values()].sort((left, right) => left.nome.localeCompare(right.nome, "pt-BR"));
}
