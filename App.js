import { StatusBar } from 'expo-status-bar';
import OnboardScreen from './components/onboarding';
import 'react-native-gesture-handler';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './components/HomeScreen';
import Inbox from './components/Inbox';
import ChatBox from './components/Chatbox';
import Search from './components/Search';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import SetUpProfile from './components/SetupProfile';
import CreatePost from './components/CreatePost';
import Notebook from './components/Notebook';
import { Lyricsheet } from './components/Lyricsheet';
import SearchDMs from './components/SearchDM';
import { Button } from 'react-native';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Onboarding" options={{ headerShown: false, animationEnabled: false }} component={OnboardScreen} />
        <Stack.Screen name="SignIn" options={{ headerShown: false, animationEnabled: false }} component={SignIn} />
        <Stack.Screen name="SignUp" options={{ headerShown: false, animationEnabled: false }} component={SignUp} />
        <Stack.Screen name="Setup" options={{ headerShown: false, animationEnabled: false }} component={SetUpProfile} />
        <Stack.Screen name="HomePage" options={{ headerShown: false, animationEnabled: false }} component={HomeScreen} />
        <Stack.Screen name="Inbox" options={{ headerShown: false, animationEnabled: false }} component={Inbox} />
        <Stack.Screen name="Search" options={{ headerShown: false, animationEnabled: false }} component={Search} />
        <Stack.Screen name="SearchDMs" options={{ title: "Search Users", headerTintColor: '#646699', headerStyle: {backgroundColor: '#BBB7EB', shadowColor: 'transparent'} }} component={SearchDMs} />
        <Stack.Screen name="Chatbox" options={({ navigation, route }) => ({ title: route.params.item.displayName, headerTintColor: '#646699', headerLeft: () => (<Button color={'#646699'} title="< Inbox" onPress={() => navigation.navigate('Inbox', route.params)}/>) })} component={ChatBox} />
        <Stack.Screen name="Profile" options={{ headerShown: false, animationEnabled: false }} component={SetUpProfile} />
        <Stack.Screen name="CreatePost" options={{ headerShown: false, animationEnabled: false }} component={CreatePost} />
        <Stack.Screen name="Notebook" options={{ headerShown: false, animationEnabled: false }} component={Notebook} />
        <Stack.Screen name="Lyricsheet" options={({ route }) => ({ title: route.params.item.title, headerTintColor: '#646699' })} component={Lyricsheet} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

