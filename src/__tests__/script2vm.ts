import { fromAskScriptAst } from '../askjsx';
import { parse } from '../askscript';
import { resources, runUntyped, Values, Options, Resource } from '../askvm';
import * as type from '../askvm/lib/type';
import { resource } from '../askvm/lib';

import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';

const defaultEnvironment: Options = {
  values: {
    hello: 'Hello, this is your Ask server!',
  },
  resources: {
    ...resources,

    helloFunction: resource({
      name: 'helloFunction',
      type: type.string,
      argsType: type.empty,
      resolver: async (): Promise<string> => {
        return 'Hello, this is your Ask server!';
      },
    }),

    helloDynamicFunction: resource({
      name: 'helloDynamicFunction',
      type: type.string,
      argsType: type.empty,
      resolver: async (): Promise<string> => {
        return "Hello, this is your Ask server! It's " + new Date().toString();
      },
    }),
  },
};

async function e2e(
  script: string,
  environment: Options = defaultEnvironment
): Promise<any> {
  const ast = parse(script);
  const askCode = fromAskScriptAst(ast);

  return runUntyped(environment, askCode);
}

describe('simple e2e tests', () => {
  test('e2e #1', async () => {
    const output = await e2e(`ask {
      'Hello world!'
  }`);
    expect(output).toBe('Hello world!');
  });

  test('e2e #2', async () => {
    const output = await e2e(`ask {
      hello
  }`);
    expect(output).toBe(defaultEnvironment.values?.hello);
  });

  // // TODO(mh):
  // // Unknown identifier 'helloFunction'!
  // test('e2e #3 -- not implemented', async () => {
  //   const output = await e2e(`ask {
  //         helloFunction()
  //   }`);

  //   expect(output).toBe(
  //     await defaultEnvironment.resources?.helloFunction.resolver()
  //   );
  // });

  // // TODO(mh):
  // // Expected: "Hello, this is your Ask server! It's Thu May 14 2020 23:03:43 GMT+0200 (Central European Summer Time)"
  // // Received: {}
  // test('e2e #4 -- wrong output', async () => {
  //   const output = e2e(`ask {
  //         helloDynamicFunction()
  //   }`);

  //   expect(output).toBe(
  //     await defaultEnvironment.resources?.helloDynamicFunction.resolver()
  //   ); // This might be 'a bit' flaky, since the time is returned with second precision
  // });
});

describe('running .ask files produces expected output', () => {
  const expectedOutputFilesGlobPath = path.join(
    __dirname,
    '..',
    'askscript',
    '__tests__',
    '[0-9][0-9]-*',
    '*.result.tsx'
  );

  const expectedResultFilePaths = glob.sync(expectedOutputFilesGlobPath);
  // console.log(`expectedOutputFilesGlobPath: ${expectedOutputFilesGlobPath}`);
  // console.log(`expectedResultFilePaths: ${expectedResultFilePaths}`);

  for (const expectedResultFilePath of expectedResultFilePaths) {
    const parts1 = path.parse(expectedResultFilePath);
    const parts2 = path.parse(parts1.name);

    const askScriptFilePath = path.join(parts1.dir, `${parts2.name}.ask`);

    const parts = path.parse(askScriptFilePath);
    // if (parts.base != 'program14d-method_call_args.ask') continue;

    test(`produces correct result for ${parts2.name}.ask`, async () => {
      // Read .ask source code
      const askScriptCode = fs.readFileSync(askScriptFilePath).toString();
      // console.log(`askScriptCode: ${askScriptCode}`);

      // Read environment, if available
      const environmentFilePath = path.join(parts.dir, '_environment.ts');

      let environment: Options;
      if (fs.existsSync(environmentFilePath)) {
        const newEnvironment = require(environmentFilePath);
        environment = {
          values: newEnvironment.values,
          resources: { ...resources, ...newEnvironment.resources },
        };
      } else {
        // Using default environment
        environment = defaultEnvironment;
      }

      // Run the .ask code
      const result = await e2e(askScriptCode, environment);

      // Read expected output
      // console.log('expectedResultFilePath: ' + expectedResultFilePath);
      const debug1 = require(expectedResultFilePath);

      // Validate output
      expect(result).toEqual(debug1.expectedResult);
    });
    // break;
  }
});
