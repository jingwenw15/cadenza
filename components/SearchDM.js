import { Text, SafeAreaView, View, TextInput, FlatList, Pressable, Alert } from 'react-native';
import React from 'react';
import styles from '../styles/Stylesheet';
import Footer from './footer';
import { supabase } from '../env/supabase';
import 'react-native-url-polyfill/auto';

export function SearchBar({ username, setUsername }) {
    return (
        <TextInput onChangeText={text => {
            setUsername(text);
        }}
            clearButtonMode={true}
            autoCorrect={false}
            autoCapitalize={false}
            selectionColor={'#646699'}
            style={{ padding: 5, width: '80%', height: '5%', backgroundColor: '#E7E3EA', borderRadius: 5, borderWidth: 2, borderColor: '#E7E3EA' }}
            value={username} placeholder={"Type username here"} />
    )
}


export default function SearchDMs({ navigation, route }) {

    let sub;
    const listenToChanges = async () => {
        sub = supabase.channel('users').on('postgres_changes', { event: '*', schema: '*' }, (payload) => {
            console.log("a change: ");
        }).subscribe();
        GetUsers();
    };

    React.useEffect(() => {
        listenToChanges();
        return () => sub?.unsubscribe();
    }, []);

    const [username, setUsername] = React.useState('');

    const [usersFound, setUsersFound] = React.useState([]);

    async function GetUsers() {
        if (username === '') {
            setUsersFound([]);
            return;
        }
        const { data, error } = await supabase.from('users').select('*').ilike('username', username + '%');
        setUsersFound(data);
    }

    React.useEffect(() => {
        GetUsers();
    }, [username]);

    function renderUser({ item }) {

        async function getUserEmail() {
            const user = await supabase.auth.getUser();
            const userEmail = user.data.user.email;
            return userEmail;
        };

        async function setUpChatItem() {
            let user = {};
            user.avatar = item.avatar;
            user.userId = item.email;
            user.curUser = await getUserEmail();
            user.displayName = item.display_name;
            user.mostRecentMsg = ''; // none 
            
            // cannot message yourself 
            if (user.curUser === user.userId) {
                Alert.alert("Cannot message yourself!");
                return;
            }

            let messages = [];
            let params = route.params;
            params.item = user;
            params.messages = messages;
            navigation.navigate('Chatbox', params);
        }

        return (
            <View style={{ marginTop: 15, flexDirection: 'row' }}>
                <Pressable onPress={async () => await setUpChatItem()}>
                    <View style={{flexDirection: 'row'}}>
                        <Text style={{ marginRight: 10, color: '#646699' }}>{item.display_name}</Text>
                        <Text style={{ marginRight: 10, color: '#646699' }}>@{item.username}</Text>
                    </View>
                </Pressable>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.searchPage}>
            <View style={styles.searchBody}>
                <SearchBar username={username} setUsername={setUsername} />
                <FlatList scrollEnabled={true} data={usersFound} renderItem={(item) => renderUser(item)} keyExtractor={(item) => item.email} />
            </View>
            <Footer route={route} navigation={navigation} />
        </SafeAreaView>
    )
}

