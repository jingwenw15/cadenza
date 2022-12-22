import { SafeAreaView, View, Text, TextInput, Image, Button, Pressable } from 'react-native';
import styles from '../styles/Stylesheet';
import * as React from 'react';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../env/supabase';
import { decode } from 'base64-arraybuffer';
import Footer from './footer';
import 'react-native-url-polyfill/auto';


export default function SetupProfile({ route, navigation }) {
    const [username, setUsername] = React.useState("");
    const [displayName, setDisplayName] = React.useState("");
    const [avatarPath, setAvatarPath] = React.useState("");

    async function getUserInfo() {
        // DO NOT DELETE: for some reason, the params get lost sometimes. This is just to double reinforce. 
        const user = await supabase.auth.getUser();
        let userEmail = route.params.email; 
        if (!userEmail || userEmail === "") {
            userEmail = user.data.user.email;
        }
        const {data, error} = await supabase.from('users').select('*').eq('email', userEmail);
        if (error) {
            console.log('names were not retrieved.');
            return;
        }
        setUsername(data[0].username);
        setDisplayName(data[0].display_name);
        setAvatarPath(data[0].avatar);
    }

    React.useEffect(() => {
        getUserInfo();
    }, []);

    // DO NOT DELETE: the params get lost sometimes. just to be safe.
    // assume that if firstTime param is lost, it's not the first time. 
    let firstTime = false;
    if (route.params.firstTime && route.params.firstTime === true) {
        firstTime = true;
    }

    async function updateAvatar(avatarPath) {
        async function getUserEmail() {
            const user = await supabase.auth.getUser();
            const userEmail = user.data.user.email;
            return userEmail;
        };
    
        let userEmail = await getUserEmail();
        const { data, error } = await supabase.from('users')
            .update({ avatar: avatarPath })
            .eq('email', userEmail)
            .select();
        if (error) {
            console.log("could not update profile: ", error);
        }
    }


    return (
        <SafeAreaView style={{ backgroundColor: '#BBB7EB', height: '100%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 15}}>
                <Text style={styles.headerText}>Your Profile</Text>
            </View>
            <Avatar email={route.params.email} url={avatarPath} onUpload={async (url) => {
                setAvatarPath(url);
                await updateAvatar(url);
            }} />
            <View style={styles.profileBody}>
                <Text style={{color: '#646699'}}>Username: </Text>
                <TextInput onChangeText={setUsername} value={username} placeholder='Set username' style={styles.signInField} />
                <Text style={{color: '#646699'}}>Display name: </Text>
                <TextInput onChangeText={setDisplayName} value={displayName} placeholder='Set display name' style={styles.signInField} />

                <Pressable onPress={async () => {
                    await updateProfile(displayName, username, avatarPath, route.params.email);
                    route.params.firstTime = false;
                    navigation.navigate('HomePage', route.params);
                    }}>
                    <Text style={{ color: '#646699', textAlign: 'center', marginTop: 20 }}>Update Profile!</Text>
                </Pressable>
            </View>
            {firstTime === false ? (<Footer route={route} navigation={navigation} />) : null}
        </SafeAreaView>
    )
}

async function updateProfile(displayName, username, avatarPath, email) {
    async function getUserEmail() {
        const user = await supabase.auth.getUser();
        const userEmail = user.data.user.email;
        return userEmail;
    };

    let userEmail = email;

    if (!email || email === "") {
        userEmail = await getUserEmail();
    }
    const { data, error } = await supabase.from('users')
        .update({ username: username, display_name: displayName, avatar: avatarPath })
        .eq('email', userEmail)
        .select();
    if (error) {
        console.log("could not update profile: ", error);
    }
}

// CITATION code below is adapted from: https://supabase.com/docs/guides/with-expo
// https://docs.expo.dev/versions/latest/sdk/imagepicker/#imagepickeroptions
function Avatar({ url, email, onUpload }) {
    const [uploading, setUploading] = React.useState(false);
    const [avatarUrl, setAvatarUrl] = React.useState('');
    const [avatarLink, setAvatarLink] = React.useState('');

    async function getUserEmail() {
        const user = await supabase.auth.getUser();
        const userEmail = user.data.user.email;
        return userEmail;
    };

    React.useEffect(() => {
        if (url !== '') {
            downloadImage(url);
        } else {
            getUserAvatar();
            if (avatarLink && avatarLink !== '') downloadImage(avatarLink);
        }
    }, [url]);

    async function getUserAvatar() {
        if (!email || email === "") {
            email = await getUserEmail();
        }
        const { data, error } = await supabase.from('users').select('*').eq('email', email);
        if (error) {
            console.log('could not get user avatar');
            return;
        }
        setAvatarLink(data[0].avatar);
    }

    async function downloadImage(path) {
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path);
            const fileReader = new FileReader();
            fileReader.readAsDataURL(data);
            fileReader.onload = () => {
                setAvatarUrl(fileReader.result);
            }
        } catch (error) {
            console.log("could not download image: ", error.message);
        }
    }

    async function uploadAvatar() {
        try {
            setUploading(true);
            const file = await ImagePicker.launchImageLibraryAsync({
                mediatypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [3, 3],
                quality: 1,
                base64: true
            });

            const fileExt = file.assets[0].uri.split('.').pop();

            const filePath = `${Math.random()}.${fileExt}`;
            const { data, error } = await supabase.storage.from('avatars').upload(filePath, decode(file.assets[0].base64), { contentType: 'image/jpg' });

            if (error) {
                console.log("Could not upload image: ", error);
                return;
            }
            setAvatarUrl('data:image/jpeg;base64,' + file.assets[0].base64); // temp 
            onUpload(filePath);
            setUploading(false);
        } catch (error) {
            setUploading(false);
        }
    }

    return (
        <View style={{ flexDirection: 'column', alignItems: 'center', marginTop: 30 }}>
            {avatarUrl !== '' ? (
                <Image source={{ uri: avatarUrl }} style={{ width: 50, height: 50 }} />
            ) : (
                <Image style={{ width: 60, height: 60 }} source={require('../images/profile.png')} />
            )}
            <View>
                <Button title={uploading ? 'Uploading...' : 'Upload Image'}
                    onPress={uploadAvatar}
                    disabled={uploading} color='#646699' />
            </View>
        </View>
    )
}