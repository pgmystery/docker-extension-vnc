import React from "react";
import ReactDOM from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { DockerMuiV6ThemeProvider } from "@docker/docker-mui-theme";

import MainStyle from './style/MainStyle'
import { App } from './App';
import { DialogsProvider } from '@toolpad/core'

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/*
      If you eject from MUI (which we don't recommend!), you should add
      the `dockerDesktopTheme` class to your root <html> element to get
      some minimal Docker theming.
    */}
    <DockerMuiV6ThemeProvider>
      <CssBaseline />
      <MainStyle />
      <DialogsProvider>
        <App />
      </DialogsProvider>
    </DockerMuiV6ThemeProvider>
  </React.StrictMode>
);
