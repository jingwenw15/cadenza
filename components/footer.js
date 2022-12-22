import styles from '../styles/Stylesheet';
import { View, Pressable, Image } from 'react-native';


export default function footer({ route, navigation }) {
    return (
        <View style={styles.footer}>
            <Pressable onPress={() => navigation.navigate('HomePage', route.params)}>
                <Image style={styles.logo} source={require('../images/feed.png')} />
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Notebook', route.params)}>
                <Image style={styles.logo} source={require("../images/cloud.png")}/>
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Search', route.params)}>
                <Image style={styles.logo} source={require('../images/search.png')} />
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Inbox', route.params)}>
                <Image style={styles.logo} source={require('../images/inbox.png')} />
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Profile', route.params)}>
                <Image style={styles.logo} source={require('../images/profile.png')} />
            </Pressable>
        </View>
    )
}