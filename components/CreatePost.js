import React from 'react';
import { Text, SafeAreaView, View, Pressable } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { supabase } from '../env/supabase';
import styles from '../styles/Stylesheet';
import Footer from './footer';

export default function CreatePost({navigation, route}) {

    const [postText, setPostText] = React.useState('');

    async function postToDB() {
        const {data, error} = await supabase.from('posts').insert({
            email: route.params.email,
            text: postText,
        });
        if (error) {
            console.log("could not insert post into db", error);
        }
        navigation.navigate('HomePage', route.params);
    }

    return (
        <SafeAreaView style={{ backgroundColor: '#BBB7EB', height: '100%' }}>
            <View style={styles.feedHeader}>
                <Text style={styles.headerText}>Create Post</Text>
            </View>
            <View style={styles.body}>
                <View style={{ backgroundColor: '#E7E3EA', marginTop: 30, marginLeft: 30, marginRight: 30, borderRadius: 20 }}>
                    <TextInput  selectionColor={'#646699'} onChangeText={setPostText} value={postText} multiline={true} style={styles.postInput}/>
                </View>
                <Pressable onPress={postToDB} style={{marginTop: 15, backgroundColor: '#E7E3EA', borderRadius: 10, padding: 5}}>
                        <Text style={{color: '#646699'}}>Post!</Text>
                </Pressable>
            </View>
            <Footer route={route} navigation={navigation} />
        </SafeAreaView>
    )
}