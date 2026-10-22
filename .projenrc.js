const { typescript } = require('projen');
const project = new typescript.TypeScriptProject({
  defaultReleaseBranch: 'main',
  name: '@dynamic-labs/passport-dynamic',
  license: 'MIT',
  copyrightOwner: 'Dynamic Labs',

  deps: ['passport-strategy', 'jsonwebtoken@^9.0.2'],

  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  devDeps: [
    'supertest@^6.2.3',
    '@types/supertest',
    '@types/passport',
    '@types/passport-strategy',
    '@types/jsonwebtoken@^9.0.2',
    '@types/express@4.17.13',
    'keypair',
    'express',
    'passport',
  ] /* Build dependencies for this module. */,
  // packageName: undefined,  /* The "name" in package.json. */
  releaseToNpm: true,
  workflowNodeVersion: '22.x',
  repository: 'https://github.com/dynamic-labs/passport-dynamic.git',
  npmDistTag: 'latest',
  npmRegistryUrl: 'https://registry.npmjs.org',
  packageManager: 'npm',
  projenVersion: '0.78.8',
});

// This projen version still generates Node-20-era actions; bump to Node 24
// runtimes (checkout@v6, setup-node@v6, artifact actions@v5,
// create-pull-request@v7).
const actionSteps = {
  'build': { 'build': { 0: 'actions/checkout@v6', 1: 'actions/setup-node@v6', 5: 'actions/upload-artifact@v5' }, 'self-mutation': { 0: 'actions/checkout@v6', 1: 'actions/download-artifact@v5' } },
  'release': { release: { 0: 'actions/checkout@v6', 2: 'actions/setup-node@v6', 7: 'actions/upload-artifact@v5' }, release_github: { 0: 'actions/setup-node@v6', 1: 'actions/download-artifact@v5' }, release_npm: { 0: 'actions/setup-node@v6', 1: 'actions/download-artifact@v5' } },
  'upgrade-main': { upgrade: { 0: 'actions/checkout@v6', 1: 'actions/setup-node@v6', 5: 'actions/upload-artifact@v5' }, pr: { 0: 'actions/checkout@v6', 1: 'actions/download-artifact@v5', 4: 'peter-evans/create-pull-request@v7' } },
};
for (const [file, jobs] of Object.entries(actionSteps)) {
  const wf = project.tryFindObjectFile(`.github/workflows/${file}.yml`);
  for (const [job, steps] of Object.entries(jobs)) {
    for (const [i, action] of Object.entries(steps)) {
      wf.addOverride(`jobs.${job}.steps.${i}.uses`, action);
    }
  }
}
// upload-artifact@v4 excludes hidden files by default; .repo.patch is hidden
for (const file of ['build', 'upgrade-main']) {
  const wf = project.tryFindObjectFile(`.github/workflows/${file}.yml`);
  const job = file === 'build' ? 'build' : 'upgrade';
  wf.addOverride(`jobs.${job}.steps.5.with.include-hidden-files`, true);
}

project.synth();
