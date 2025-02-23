/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/signin`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(app)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `${'/(app)'}/TaskEditForm` | `/TaskEditForm`; params?: Router.UnknownInputParams; } | { pathname: `/components/NavBar`; params?: Router.UnknownInputParams; } | { pathname: `/components/TextCustom`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/signin`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(app)'}` | `/`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(app)'}/TaskEditForm` | `/TaskEditForm`; params?: Router.UnknownOutputParams; } | { pathname: `/components/NavBar`; params?: Router.UnknownOutputParams; } | { pathname: `/components/TextCustom`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/signin${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | `${'/(app)'}${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `${'/(app)'}/TaskEditForm${`?${string}` | `#${string}` | ''}` | `/TaskEditForm${`?${string}` | `#${string}` | ''}` | `/components/NavBar${`?${string}` | `#${string}` | ''}` | `/components/TextCustom${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/signin`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(app)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `${'/(app)'}/TaskEditForm` | `/TaskEditForm`; params?: Router.UnknownInputParams; } | { pathname: `/components/NavBar`; params?: Router.UnknownInputParams; } | { pathname: `/components/TextCustom`; params?: Router.UnknownInputParams; };
    }
  }
}
