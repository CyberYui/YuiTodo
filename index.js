// 应用入口：注册手势处理 + 启动应用根组件
// 注意：gesture-handler必须放在文件最顶部导入，否则手势可能不生效
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import App from './App';

// 注册根组件到Expo运行时
registerRootComponent(App);
