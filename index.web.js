/**
 * Web entry point for React Native Web
 *
 * This file bootstraps the React Native app for web browsers.
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Register the app
AppRegistry.registerComponent(appName, () => App);

// Run the app on the web
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('root'),
});

// Enable hot module replacement in development
if (module.hot) {
  module.hot.accept();
}
