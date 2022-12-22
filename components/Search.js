import { Text, SafeAreaView, View, TextInput, FlatList, Pressable, Alert } from 'react-native';
import React from 'react';
import styles from '../styles/Stylesheet';
import Footer from './footer';
import { supabase } from '../env/supabase';
import 'react-native-url-polyfill/auto';

export function SearchBar({ username, setUsername }) {
    return (
        <TextInput
        onChangeText={text => {
            setUsername(text);
        }}
            clearButtonMode={true}
            autoCorrect={false}
            autoCapitalize={false}
            selectionColor={'#646699'}
            style={{ color: '#646699', padding: 5, width: '80%', height: '5%', backgroundColor: '#E7E3EA', borderRadius: 5, borderWidth: 2, borderColor: '#E7E3EA' }}
            value={username} placeholder={"Type username here"} />
    )
}


export default function Search({ navigation, route }) {

    let sub;
    const listenToChanges = async () => {
        sub = supabase.channel('users').on('postgres_changes', { event: '*', schema: '*' }, (payload) => {
            console.log("a change: ", payload);
        }).subscribe();
        GetUsers();
        GetFollowing();
    };

    React.useEffect(() => {
        listenToChanges();
        return () => sub?.unsubscribe();
    }, []);

    const [username, setUsername] = React.useState('');

    const [usersFound, setUsersFound] = React.useState([]);

    const [allFollowing, setAllFollowing] = React.useState([]);

    async function getUserEmail() {
        const user = await supabase.auth.getUser();
        const userEmail = user.data.user.email;
        return userEmail;
    };

    async function GetFollowing() {
        if (!route.params.email || route.params.email === "") {
            route.params.email = await getUserEmail();
        }
        const { data, error } = await supabase.from('users').select('following').eq('email', route.params.email);
        if (error) {
            console.log("could not get following list: ", error);
            return;
        }
        if (!data || data.length === 0 || data[0].length === 0) return;
        setAllFollowing(data[0].following);
    }

    React.useEffect(() => {
        GetFollowing();
    }, []);

    async function GetUsers() {
        if (username === '') {
            setUsersFound([]);
            return;
        }
        const { data, error } = await supabase.from('users').select('email, username, display_name').ilike('username', username + '%');
        setUsersFound(data);
    }

    React.useEffect(() => {
        GetUsers();
    }, [username]);


    const addFollowing = async (email) => {
        let { data, error } = await supabase.from('users').select('following').eq('email', route.params.email);
        if (error) {
            console.log('could not get following: ', error);
            return;
        }
        let following = data[0].following;
        if (!following.includes(email) && email !== route.params.email) {
            // follow user
            following.push(email);
        } else {
            // unfollow user
            const idx = following.indexOf(email);
            following.splice(idx, 1);
        }
        
        let result = await supabase.from('users')
            .update({ following: following })
            .eq('email', route.params.email)
            .select();
        if (result.error) {
            console.log('could not updating following list: ', result.error);
            return;
        }
        setAllFollowing(following);
    }

    function renderUser({ item }) {
        return (
            <UserCard item={item}/>
        )
    }

    function UserCard({ item }) {
        let initialFollowState = (allFollowing.includes(item.email)) ? "Unfollow" : "Follow";
        let isYourself = false;
        if (route.params.email === item.email) {
            isYourself = true;
        }
        const [followState, setFollowState] = React.useState(initialFollowState);
        function toggleFollow() {
            if (allFollowing.includes(item.email)) {
                setFollowState("Unfollow");
            } else {
                setFollowState("Follow");
            }
        }

        return (
            <View style={styles.searchIndivUser}>
                <Text style={{ marginRight: 10, color: '#483E54' }}>{item.display_name}</Text>
                <Text style={{ marginRight: 10, color: '#6A5D79' }}>@{item.username}</Text>
                <Pressable onPress={() => {
                    addFollowing(item.email);
                    toggleFollow();
                }}>
                    {(isYourself) ? null : (<Text style={{ marginRight: 10, color: '#646699' }}>{followState}</Text>)}
                </Pressable>
            </View>
        )
    }
    
    return (
        <SafeAreaView style={styles.searchPage}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Search For Users</Text>
            </View>
            <View style={styles.searchBody}>
                <SearchBar username={username} setUsername={setUsername} />
                <FlatList scrollEnabled={true} data={usersFound} renderItem={(item) => renderUser(item)} keyExtractor={(item) => item.email} />
            </View>
            <Footer route={route} navigation={navigation} />
        </SafeAreaView>
    )
}

