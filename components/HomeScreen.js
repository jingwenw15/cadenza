import React from 'react';
import { Text, SafeAreaView, View, Image, Pressable, FlatList } from 'react-native';
import { supabase } from '../env/supabase';
import 'react-native-url-polyfill/auto';
import styles from '../styles/Stylesheet';
import Footer from './footer';


export default function HomeScreen({ route, navigation }) {
    const [feed, setFeed] = React.useState([]);

    async function GetFeed() {
        const followData = await supabase.from('users')
            .select('following')
            .eq('email', route.params.email);
        if (followData.error) {
            console.log("error getting followers: ", followData.error);
            return;
        }
        let feedUsers = followData.data[0].following;
        feedUsers.push(route.params.email);
        const { data, error } = await supabase.from('posts').select(
            `
            *,
            users(username, display_name, avatar)
            `
        )
        .in('email', feedUsers)
        .order('created_at', {ascending: false});
        if (error) {
            console.log('could not get feed: ', error);
        }
        setFeed(data);
    }

    React.useEffect(() => {
        GetFeed();
    }, []);

    let sub; 
    const listenToFeedChanges = async () => {
        sub = supabase.channel('posts').on('postgres_changes', { event: '*', schema: '*' }, (payload) => {
            console.log("a change: ");
            GetFeed();
        }).subscribe();
    };

    React.useEffect(() => {
        listenToFeedChanges();
        return () => sub?.unsubscribe(); 
    }, []);

    return (
        <SafeAreaView style={{ backgroundColor: '#BBB7EB', height: '100%', alignItems: 'center' }}>
            <View style={styles.feedHeader}>
                <Text style={styles.headerText}>Your Feed</Text>
            </View>
            <View style={styles.body}>
                {(feed.length === 0) ? <Text style={{marginTop: 20, color: '#646699', textAlign: 'center'}}>No posts to see yet! Follow a user or create a post to get started.</Text> 
                : <FlatList scrollEnabled={true} data={feed} renderItem={(item) => renderPost(item)} keyExtractor={(item) => item.created_at} />}
            </View>
            <Pressable onPress={() => navigation.navigate('CreatePost', route.params)}>
                <Image style={styles.writeLogo} source={require("../images/write.png")} />
            </Pressable>
            <Footer route={route} navigation={navigation} />
        </SafeAreaView>
    )
}

function renderPost({ item }) {
    let timeUnit = 's';
    const date = new Date(item.created_at);
    let diff = (Date.now() - date) / 1000; // seconds 
    let roundedDiff = Math.round(diff);
    if (diff > 59) {
        roundedDiff = Math.round(diff / 60); // minutes 
        timeUnit = 'm';
        if ((diff / 60) > 59) {
            roundedDiff = Math.round(diff / (60 * 60)); // hours 
            timeUnit = 'h';
            if (roundedDiff > 23) {
                roundedDiff = Math.round(diff / (60 * 60 * 24)); // days 
                timeUnit = 'd';
            }
        }
    } 

    return (
        <Post avatar={item.users.avatar} name={item.users.display_name} id={item.users.username} createdAt={roundedDiff + timeUnit} text={item.text} />
    )
}

function Post({ name, id, createdAt, text, avatar }) {
    const [avatarUrl, setAvatarUrl] = React.useState('');
    async function downloadImage(path) {
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path);
            const fileReader = new FileReader();
            // reference: https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
            fileReader.readAsDataURL(data);
            fileReader.onload = () => {
                setAvatarUrl(fileReader.result);
            }
        } catch (error) {
            console.log("could not download image: ", error.message);
        }
    }

    React.useEffect(() => {
        downloadImage(avatar);
    }, [avatar]);

    return (
        <View style={styles.post}>
            {(avatarUrl !== '') ? <Image style={styles.profilePic} source={{uri: avatarUrl}} /> : <Image style={styles.profilePic} source={require('../images/profile.png')} />}
            <View>
                <View style={styles.userMetadata}>
                    <Text style={{ color: '#483E54', marginRight: 10 }}>{name}</Text>
                    <Text style={{ color: '#6A5D79', marginRight: 10 }}>@{id}</Text>
                    <Text style={{ color: '#1F0E33' }}>{createdAt}</Text>
                </View>
                <Text style={styles.bodyText}>{text}</Text>
            </View>
        </View>
    )
}
