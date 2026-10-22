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

// actions/(upload|download)-artifact@v3 is deprecated and hard-fails; pin to v4
// (v4 upload requires v4 download). This projen version still generates v3.
const artifactSteps = {
  'build': { 'build': { 5: 'actions/upload-artifact@v4' }, 'self-mutation': { 1: 'actions/download-artifact@v4' } },
  'release': { 'release': { 7: 'actions/upload-artifact@v4' }, 'release_github': { 1: 'actions/download-artifact@v4' }, 'release_npm': { 1: 'actions/download-artifact@v4' } },
  'upgrade-main': { 'upgrade': { 5: 'actions/upload-artifact@v4' }, 'pr': { 1: 'actions/download-artifact@v4' } },
};
for (const [file, jobs] of Object.entries(artifactSteps)) {
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
