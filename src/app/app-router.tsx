import { Navigate, Route as RouterRoute, Routes } from "react-router";
import PageTitle from "../navigation/page-title";
import { Route } from "../navigation/routes";
import { resourceModules } from "./body/resource-modules/resource-modules";
import SignInScreen from "./body/screens/sign-in-screen/sign-in-screen";
import SignUpScreen from "./body/screens/sign-up-screen/sign-up-screen";
import GuidePanel from "./body/screens/source-screen/panels/guide/guide-panel";
import HomePanel from "./body/screens/source-screen/panels/home/home-panel";
import PrintDeckPanel from "./body/screens/source-screen/panels/print-deck/print-deck-panel";
import ResourceDetailRoute from "./body/screens/source-screen/panels/resource-detail/resource-detail-route";
import ResourcesRoute from "./body/screens/source-screen/panels/resources/resources-route";
import SourceSettingsRoute from "./body/screens/source-screen/panels/settings/source-settings-route";
import SourcesPanel from "./body/screens/source-screen/panels/sources/sources-panel";
import SourceScreen from "./body/screens/source-screen/source-screen";

//------------------------------------------------------------------------------
// App Router
//------------------------------------------------------------------------------

export default function AppRouter() {
  return (
    <>
      <PageTitle />
      <Routes>
        <RouterRoute element={<SignInScreen />} path={Route.SignIn} />
        <RouterRoute element={<SignUpScreen />} path={Route.SignUp} />
        <RouterRoute element={<SourceScreen />} path="/">
          <RouterRoute element={<HomePanel />} index />
          <RouterRoute element={<GuidePanel />} path="guide" />
          <RouterRoute element={<SourcesPanel />} path="sources" />
          <RouterRoute element={<SourceSettingsRoute />} path="sources/:sourceId" />
          <RouterRoute element={<PrintDeckPanel />} path="print-deck" />
          <RouterRoute
            element={<ResourceDetailRoute modules={resourceModules} />}
            path="resources/:kind/:resourceId"
          />
          {resourceModules.map(({ Panel, path }) => (
            <RouterRoute
              element={<ResourcesRoute Panel={Panel} />}
              key={path}
              path={path.slice(1)}
            />
          ))}
          <RouterRoute element={<Navigate replace to={Route._} />} path="*" />
        </RouterRoute>
      </Routes>
    </>
  );
}

//------------------------------------------------------------------------------
