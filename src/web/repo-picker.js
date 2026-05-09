export function repoKey(repo) {
  return repo?.root || repo?.name || "";
}

export function taskRepoKey(task) {
  return task?.repoRoot || task?.repo || "";
}

export function selectedRepoName(state) {
  if (!state.selectedRepo) return "";
  const repo = state.repos.find((r) => repoKey(r) === state.selectedRepo);
  return repo ? repo.name : state.selectedRepo;
}
