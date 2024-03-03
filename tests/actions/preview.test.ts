import { ExpoConfig } from '@expo/config';

import {
  createSummary,
  getQrTarget,
  getSchemesInOrderFromConfig,
  getVariables,
  previewInput,
} from '../../src/actions/preview';
import { EasUpdate } from '../../src/eas';
import { projectAppType } from '../../src/expo';

jest.mock('../../src/expo');

const fakeOptions = {
  qrTarget: 'dev-client',
} as unknown as ReturnType<typeof previewInput>;

const fakeExpoConfig = {
  slug: 'fake-project',
  extra: {
    eas: { projectId: 'fake-project-id' },
  },
} as unknown as ExpoConfig;

const fakeUpdatesSingle: EasUpdate[] = [
  {
    id: 'fake-android-id',
    createdAt: '2023-02-04T14:15:20.365Z',
    group: 'fake-group-id',
    branch: 'main',
    message: 'feature: create new update',
    runtimeVersion: 'exposdk:47.0.0',
    platform: 'android',
    manifestPermalink: 'https://u.expo.dev/update/fake-android-id',
    gitCommitHash: 'aabbccdd',
  },
  {
    id: 'fake-ios-id',
    createdAt: '2023-02-04T14:15:20.365Z',
    group: 'fake-group-id',
    branch: 'main',
    message: 'feature: create new update',
    runtimeVersion: 'exposdk:47.0.0',
    platform: 'ios',
    manifestPermalink: 'https://u.expo.dev/update/fake-ios-id',
    gitCommitHash: 'aabbccdd',
  },
];

const fakeUpdatesMultiple = fakeUpdatesSingle.map(update => ({ ...update, group: `fake-group-${update.id}` }));
const fakeBranchId = 'fake-branch-id';

describe(getQrTarget, () => {
  it('returns `dev-build` for `qr-target: dev-build`', () => {
    expect(getQrTarget({ ...fakeOptions, qrTarget: 'dev-build' })).toBe('dev-build');
  });

  it('returns `dev-build` for `qr-target: dev-client`', () => {
    expect(getQrTarget({ ...fakeOptions, qrTarget: 'dev-client' })).toBe('dev-build');
  });

  it('returns `expo-go` for `qr-target: expo-go`', () => {
    expect(getQrTarget({ ...fakeOptions, qrTarget: 'expo-go' })).toBe('expo-go');
  });

  it('throws for unknown `qr-target`', () => {
    expect(() => getQrTarget({ ...fakeOptions, qrTarget: 'unknown' } as any)).toThrow(
      `Invalid QR code target: "unknown", expected "expo-go" or "dev-build"`
    );
  });

  it('returns infered `dev-build` when input is omitted', () => {
    jest.mocked(projectAppType).mockReturnValue('dev-build');
    expect(getQrTarget({ ...fakeOptions, qrTarget: undefined })).toBe('dev-build');
  });

  it('returns infered `expo-go` when input is omitted', () => {
    jest.mocked(projectAppType).mockReturnValue('expo-go');
    expect(getQrTarget({ ...fakeOptions, qrTarget: undefined })).toBe('expo-go');
  });
});

describe(getSchemesInOrderFromConfig, () => {
  it('returns empty array when not defined', () => {
    expect(getSchemesInOrderFromConfig({} as ExpoConfig)).toEqual([]);
  });

  it('returns scheme as array when defined as string', () => {
    expect(getSchemesInOrderFromConfig({ scheme: 'ega' } as ExpoConfig)).toEqual(['ega']);
  });

  it('returns schemes in order when defined as array', () => {
    expect(getSchemesInOrderFromConfig({ scheme: ['ega', 'expogithubaction'] } as ExpoConfig)).toEqual([
      'expogithubaction',
      'ega',
    ]);
  });
});

describe(createSummary, () => {
  describe('single update group', () => {
    it('returns expected message for both platforms', () => {
      expect(
        createSummary(
          fakeUpdatesSingle,
          getVariables(fakeExpoConfig, fakeUpdatesSingle, fakeOptions, fakeBranchId),
          false
        )
      ).toMatchInlineSnapshot(`
        "🚀 Expo preview is ready!

        - Project → **fake-project**
        - Platforms → **android**, **ios**
        - Runtime Version → **exposdk:47.0.0**
        - **[More info](https://expo.dev/projects/fake-project-id/updates/fake-group-id)**

        <a href="https://qr.expo.dev/eas-update?appScheme=fake-project&projectId=fake-project-id&groupId=fake-group-id"><img src="https://qr.expo.dev/eas-update?appScheme=fake-project&projectId=fake-project-id&groupId=fake-group-id" width="250px" height="250px" /></a>

        > Learn more about [𝝠 Expo Github Action](https://github.com/expo/expo-github-action/tree/main/preview#example-workflows)"
      `);
    });

    it('returns expected message for both platforms with custom app scheme', () => {
      const customSchemeConfig = { ...fakeExpoConfig, scheme: ['ega', 'expogithubaction'] };
      expect(
        createSummary(
          fakeUpdatesSingle,
          getVariables(customSchemeConfig, fakeUpdatesSingle, fakeOptions, fakeBranchId),
          false
        )
      ).toMatchInlineSnapshot(`
        "🚀 Expo preview is ready!

        - Project → **fake-project**
        - Platforms → **android**, **ios**
        - Scheme → **expogithubaction**, **ega**
        - Runtime Version → **exposdk:47.0.0**
        - **[More info](https://expo.dev/projects/fake-project-id/updates/fake-group-id)**

        <a href="https://qr.expo.dev/eas-update?appScheme=fake-project&projectId=fake-project-id&groupId=fake-group-id"><img src="https://qr.expo.dev/eas-update?appScheme=fake-project&projectId=fake-project-id&groupId=fake-group-id" width="250px" height="250px" /></a>

        > Learn more about [𝝠 Expo Github Action](https://github.com/expo/expo-github-action/tree/main/preview#example-workflows)"
      `);
    });

    it('returns expected message for android only', () => {
      const fakeUpdate = fakeUpdatesSingle.filter(update => update.platform === 'android');
      expect(createSummary(fakeUpdate, getVariables(fakeExpoConfig, fakeUpdate, fakeOptions, fakeBranchId), false))
        .toMatchInlineSnapshot(`
        "🚀 Expo preview is ready!

        - Project → **fake-project**
        - Platform → **android**
        - Runtime Version → **exposdk:47.0.0**
        - **[More info](https://expo.dev/projects/fake-project-id/updates/fake-group-id)**

        <a href="https://qr.expo.dev/eas-update?appScheme=fake-project&projectId=fake-project-id&groupId=fake-group-id"><img src="https://qr.expo.dev/eas-update?appScheme=fake-project&projectId=fake-project-id&groupId=fake-group-id" width="250px" height="250px" /></a>

        > Learn more about [𝝠 Expo Github Action](https://github.com/expo/expo-github-action/tree/main/preview#example-workflows)"
      `);
    });

    it('returns expected message for ios only', () => {
      const fakeUpdate = fakeUpdatesSingle.filter(update => update.platform === 'ios');
      expect(createSummary(fakeUpdate, getVariables(fakeExpoConfig, fakeUpdate, fakeOptions, fakeBranchId), false))
        .toMatchInlineSnapshot(`
        "🚀 Expo preview is ready!

        - Project → **fake-project**
        - Platform → **ios**
        - Runtime Version → **exposdk:47.0.0**
        - **[More info](https://expo.dev/projects/fake-project-id/updates/fake-group-id)**

        <a href="https://qr.expo.dev/eas-update?appScheme=fake-project&projectId=fake-project-id&groupId=fake-group-id"><img src="https://qr.expo.dev/eas-update?appScheme=fake-project&projectId=fake-project-id&groupId=fake-group-id" width="250px" height="250px" /></a>

        > Learn more about [𝝠 Expo Github Action](https://github.com/expo/expo-github-action/tree/main/preview#example-workflows)"
      `);
    });

    it('returns expected message for branch qr code', () => {
      const fakeUpdate = fakeUpdatesSingle.filter(update => update.platform === 'ios');
      expect(createSummary(fakeUpdate, getVariables(fakeExpoConfig, fakeUpdate, fakeOptions, fakeBranchId), true))
        .toMatchInlineSnapshot(`
        "🚀 Expo preview is ready!

        - Project → **fake-project**
        - Platform → **ios**
        - Runtime Version → **exposdk:47.0.0**
        - **[More info](https://expo.dev/projects/fake-project-id/updates/fake-group-id)**

        <a href="https://qr.expo.dev/eas-update?appScheme=fake-project&projectId=fake-project-id&branchId=fake-branch-id"><img src="https://qr.expo.dev/eas-update?appScheme=fake-project&projectId=fake-project-id&branchId=fake-branch-id" width="250px" height="250px" /></a>

        > Learn more about [𝝠 Expo Github Action](https://github.com/expo/expo-github-action/tree/main/preview#example-workflows)"
      `);
    });
  });

  describe('mutliple update groups', () => {
    it('returns expected message for both platforms', () => {
      expect(
        createSummary(
          fakeUpdatesMultiple,
          getVariables(fakeExpoConfig, fakeUpdatesMultiple, fakeOptions, fakeBranchId),
          false
        )
      ).toMatchInlineSnapshot(`
        "🚀 Expo preview is ready!

        - Project → **fake-project**
        - Platforms → **android**, **ios**

        Android <br /> _(exposdk:47.0.0)_ <br /> **[More info](https://expo.dev/projects/fake-project-id/updates/fake-group-fake-android-id)** | iOS <br /> _(exposdk:47.0.0)_ <br /> **[More info](https://expo.dev/projects/fake-project-id/updates/fake-group-fake-ios-id)**
        --- | ---
        <a href="https://qr.expo.dev/eas-update?appScheme=fake-project&projectId=fake-project-id&groupId=fake-group-fake-android-id"><img src="https://qr.expo.dev/eas-update?appScheme=fake-project&projectId=fake-project-id&groupId=fake-group-fake-android-id" width="250px" height="250px" /></a> | <a href="https://qr.expo.dev/eas-update?appScheme=fake-project&projectId=fake-project-id&groupId=fake-group-fake-ios-id"><img src="https://qr.expo.dev/eas-update?appScheme=fake-project&projectId=fake-project-id&groupId=fake-group-fake-ios-id" width="250px" height="250px" /></a>

        > Learn more about [𝝠 Expo Github Action](https://github.com/expo/expo-github-action/tree/main/preview#example-workflows)"
      `);
    });

    it('returns expected message for android only', () => {
      const fakeUpdate = fakeUpdatesSingle.filter(update => update.platform === 'android');
      expect(createSummary(fakeUpdate, getVariables(fakeExpoConfig, fakeUpdate, fakeOptions, fakeBranchId), false))
        .toMatchInlineSnapshot(`
        "🚀 Expo preview is ready!

        - Project → **fake-project**
        - Platform → **android**
        - Runtime Version → **exposdk:47.0.0**
        - **[More info](https://expo.dev/projects/fake-project-id/updates/fake-group-id)**

        <a href="https://qr.expo.dev/eas-update?appScheme=fake-project&projectId=fake-project-id&groupId=fake-group-id"><img src="https://qr.expo.dev/eas-update?appScheme=fake-project&projectId=fake-project-id&groupId=fake-group-id" width="250px" height="250px" /></a>

        > Learn more about [𝝠 Expo Github Action](https://github.com/expo/expo-github-action/tree/main/preview#example-workflows)"
      `);
    });

    it('returns expected message for ios only', () => {
      const fakeUpdate = fakeUpdatesSingle.filter(update => update.platform === 'ios');
      expect(createSummary(fakeUpdate, getVariables(fakeExpoConfig, fakeUpdate, fakeOptions, fakeBranchId), false))
        .toMatchInlineSnapshot(`
        "🚀 Expo preview is ready!

        - Project → **fake-project**
        - Platform → **ios**
        - Runtime Version → **exposdk:47.0.0**
        - **[More info](https://expo.dev/projects/fake-project-id/updates/fake-group-id)**

        <a href="https://qr.expo.dev/eas-update?appScheme=fake-project&projectId=fake-project-id&groupId=fake-group-id"><img src="https://qr.expo.dev/eas-update?appScheme=fake-project&projectId=fake-project-id&groupId=fake-group-id" width="250px" height="250px" /></a>

        > Learn more about [𝝠 Expo Github Action](https://github.com/expo/expo-github-action/tree/main/preview#example-workflows)"
      `);
    });

    it('returns Expo Go compatible QR code when forced', () => {
      const customOptions: typeof fakeOptions = { ...fakeOptions, qrTarget: 'expo-go' };
      expect(
        createSummary(
          fakeUpdatesMultiple,
          getVariables(fakeExpoConfig, fakeUpdatesMultiple, customOptions, fakeBranchId),
          false
        )
      ).toMatchInlineSnapshot(`
        "🚀 Expo preview is ready!

        - Project → **fake-project**
        - Platforms → **android**, **ios**

        Android <br /> _(exposdk:47.0.0)_ <br /> **[More info](https://expo.dev/projects/fake-project-id/updates/fake-group-fake-android-id)** | iOS <br /> _(exposdk:47.0.0)_ <br /> **[More info](https://expo.dev/projects/fake-project-id/updates/fake-group-fake-ios-id)**
        --- | ---
        <a href="https://qr.expo.dev/eas-update?projectId=fake-project-id&groupId=fake-group-fake-android-id"><img src="https://qr.expo.dev/eas-update?projectId=fake-project-id&groupId=fake-group-fake-android-id" width="250px" height="250px" /></a> | <a href="https://qr.expo.dev/eas-update?projectId=fake-project-id&groupId=fake-group-fake-ios-id"><img src="https://qr.expo.dev/eas-update?projectId=fake-project-id&groupId=fake-group-fake-ios-id" width="250px" height="250px" /></a>

        > Learn more about [𝝠 Expo Github Action](https://github.com/expo/expo-github-action/tree/main/preview#example-workflows)"
      `);
    });
  });
});
