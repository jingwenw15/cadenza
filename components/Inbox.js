import { Text, SafeAreaView, View, FlatList, Pressable, Image } from 'react-native';
import styles from '../styles/Stylesheet';
import React from 'react';
import Footer from './footer';
import { supabase } from '../env/supabase';
import 'react-native-url-polyfill/auto';


function renderUsersChatting({ item }) {
    return (
        <Chat item={item} />
    )
}


function Chat({ item }) {
    const [avatarUrl, setAvatarUrl] = React.useState('');

    async function downloadImage(path) {
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path);
            // reference: https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
            const fileReader = new FileReader();
            fileReader.readAsDataURL(data);
            fileReader.onload = () => {
                setAvatarUrl(fileReader.result);
            }
        } catch (error) {
            console.log("could not download image: ", error.message);
        }
    }
    
    React.useEffect(() => {
        if (item.avatar && item.avatar !== "") {
            downloadImage(item.avatar);
        }
    }, []);

    return (
        <Pressable onPress={() => nav.push('Chatbox', { item })}>
            <View style={styles.messagePreview}>
                {avatarUrl !== '' ? (
                    <Image source={{ uri: avatarUrl }} style={styles.profilePic} />
                ) : (
                    <Image style={styles.profilePic} source={require('../images/profile.png')} />
                )}
                <View style={{ flexDirection: 'column' }}>
                    <Text style={styles.bodyText}>{item.displayName}</Text>
                    <Text style={{color: 'gray'}}>{item.mostRecentMsg}</Text>
                </View>
            </View>
        </Pressable>
    )
}

let nav = null; 

export default function Inbox({ route, navigation }) {
    nav = navigation;

    const [usersChatting, setUsersChatting] = React.useState([]);

    async function setUpInbox() {
        async function getUserEmail() {
            let userEmail = route.params.email;
            if (!userEmail || userEmail === "") {
                const user = await supabase.auth.getUser();
                userEmail = user.data.user.email;
            }
            return userEmail;
        };

        let userEmail = route.params.email;

        if (!userEmail || userEmail === "") {
            userEmail = await getUserEmail();
        }
        // get unique users where recipient = curuser or sender = curuser 
        const usersIHaveSentMsgsTo = await supabase.from('messages').select('user:recipient').eq('sender', userEmail);
        const usersSendingMsgsToMe = await supabase.from('messages').select('user:sender').eq('recipient', userEmail);
        if (usersIHaveSentMsgsTo.error || usersSendingMsgsToMe.error) {
            console.log('could not get users for inbox: ', usersIHaveSentMsgsTo.error, usersSendingMsgsToMe.error);
            return;
        }
        const allUsersNotUnique = usersIHaveSentMsgsTo.data.concat(usersSendingMsgsToMe.data);
        const allUsersUnique = new Set(allUsersNotUnique.map(user => user.user)); // bc apparently distinct is not a postgres thing or whatever

        let allUserChattingData = [];
        for (let user of allUsersUnique) {
            const userData = await supabase.from('users').select('display_name, avatar').eq('email', user);
            if (userData.error) {
                console.log("could not get user: ", userData.error);
                return;
            }
            let userMetadata = {};
            userMetadata.avatar = userData.data[0].avatar;
            userMetadata.userId = user; // email 
            userMetadata.curUser = userEmail; // my (cur user's) email 
            userMetadata.displayName = userData.data[0].display_name;

            // now get most recent message 
            // this is highly inefficient
            const mostRecentMsgOption1 = await supabase.from('messages')
                .select('*')
                .eq('sender', user)
                .eq('recipient', userEmail)
                .order('createdAt', { ascending: false })
                .limit(1);

            const mostRecentMsgOption2 = await supabase.from('messages')
                .select('*')
                .eq('recipient', user)
                .eq('sender', userEmail)
                .order('createdAt', { ascending: false })
                .limit(1);

            if (mostRecentMsgOption1.error || mostRecentMsgOption2.error) {
                console.log("could not get most recent message: ");
            }

            // one of the most recent msgs could be empty, this is fine, but both CANNOT be zero 
            let mostRecentMsg = null;
            if (mostRecentMsgOption1.data.length === 0 && mostRecentMsgOption2.data.length === 1) {
                mostRecentMsg = mostRecentMsgOption2.data[0];
            } else if (mostRecentMsgOption1.data.length === 1 && mostRecentMsgOption2.data.length === 0) {
                mostRecentMsg = mostRecentMsgOption1.data[0];
            } else {
                mostRecentMsg = (mostRecentMsgOption1.data[0].createdAt > mostRecentMsgOption2.data[0].createdAt) ?
                    mostRecentMsgOption1.data[0] : mostRecentMsgOption2.data[0];
            }
            userMetadata.mostRecentMsg = mostRecentMsg.text;
            allUserChattingData.push(userMetadata);
        }
        setUsersChatting(allUserChattingData);
    }

    React.useEffect(() => {
        setUpInbox();
    }, []);

    let sub;
    const listenToChanges = async () => {
        sub = supabase.channel('messages').on('postgres_changes', { event: '*', schema: '*' }, (payload) => {
            console.log("a change: ");
            setUpInbox();
        }).subscribe();
    };

    React.useEffect(() => {
        listenToChanges();
        return () => sub?.unsubscribe();
    }, []);


    let bodyPart = <FlatList data={usersChatting} renderItem={(item) => renderUsersChatting(item)} keyExtractor={(item) => item.userId} />;

    if (usersChatting.length === 0) {
        bodyPart = <Text style={{ textAlign: 'center', width: '90%', color: '#646699' }}>No messages found! Start chatting with a fellow musician now.</Text>
    }

    return (
        <SafeAreaView style={{ backgroundColor: '#BBB7EB', height: '100%' }}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Your Inbox</Text>
            </View>
            <View style={styles.body}>
                <Pressable onPress={() => navigation.navigate('SearchDMs', route.params)}>
                    <Image style={styles.writeLogo} source={require('../images/write.png')} />
                </Pressable>
                {bodyPart}
            </View>
            <Footer route={route} navigation={navigation} />
        </SafeAreaView>
    )
}



