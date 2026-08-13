/**
 * @format
 */

import 'react-native-gesture-handler';
import './src/lib/notifications/backgroundHandler';
import { installGlobalAppAlert } from './src/lib/ui/appAlert';

installGlobalAppAlert();

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
