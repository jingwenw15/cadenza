import React from 'react';
import { Text, SafeAreaView, View, Image, Pressable, FlatList, Modal, TextInput } from 'react-native';
import { supabase } from '../env/supabase';
import 'react-native-url-polyfill/auto';
import styles from '../styles/Stylesheet';
import Footer from './footer';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AntDesign } from '@expo/vector-icons';


export default function Notebook({ navigation, route }) {
    const [sheets, setSheets] = React.useState([]);

    async function getUserEmail() {
        let userEmail = route.params.email;
        if (!userEmail || userEmail === "") {
            const user = await supabase.auth.getUser();
            userEmail = user.data.user.email;
        }
        return userEmail;
    };

    async function getSheets() {
        let email = await getUserEmail();
        const { data, error } = await supabase.from('sheets').select('id, email, title, text, soundUri').eq('email', email);
        setSheets(data);
    }

    React.useEffect(() => {
        getSheets();
    }, []);

    let sub;
    const listenToChanges = async () => {
        let email = await getUserEmail();
        sub = supabase.channel('sheets').on('postgres_changes', { event: '*', schema: '*' }, (payload) => {
            console.log("a change: ");
            getSheets();
        });
    };

    React.useEffect(() => {
        listenToChanges();
        // return () => sub?.unsubscribe(); 
    }, []);

    function renderSheetPreview({ item }) {
        return (
            <View style={styles.sheetPreview}>
                <Pressable onPress={() => navigation.navigate('Lyricsheet', { item })}>
                    <Text style={{ textAlign: 'center', color: '#646699' }}>{item.title}</Text>
                </Pressable>
            </View>
        )
    }

    const [modalOn, setModal] = React.useState(false);
    const [sheetName, setSheetName] = React.useState('');

    async function sendToDB() {
        let email = await getUserEmail();
        const { data, error } = await supabase.from('sheets').insert({ 'email': email, 'title': sheetName, 'text': '', soundUri: '' }).select('id, email, title, text');
        if (error) {
            console.log('could not upload sheet to DB: ', error);
        }
        let item = data[0];
        navigation.navigate('Lyricsheet', { item });
    }

    return (
        <SafeAreaView style={{ backgroundColor: '#BBB7EB', height: '100%', alignItems: 'center' }}>
            <Modal animationType={'slide'} visible={modalOn}>
                <SafeAreaView style={{ backgroundColor: '#BBB7EB', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ backgroundColor: 'white', marginLeft: 30, marginRight: 30, borderRadius: 20 }}>
                        <Pressable onPress={() => {
                            setModal(false);
                            setSheetName("");
                            }}>
                            <View style={{flexDirection: 'row', justifyContent: 'flex-end', padding: 5}}>
                                <AntDesign name="close" size={24} color="#646699" />
                            </View>
                        </Pressable>
                        <Text style={{ color: '#646699', textAlign: 'center', marginTop: 30, marginBottom: 15, marginLeft: 30, marginRight: 30 }}>Create Lyric Sheet: </Text>
                        <TextInput value={sheetName} onChangeText={setSheetName} style={{ color: '#646699', textAlign: 'center', marginBottom: 30, marginLeft: 20, marginRight: 20 }} placeholder="Enter song name" />
                        <Pressable onPress={async () => {
                            setModal(false);
                            await sendToDB();
                            setSheetName("");
                        }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                                <Ionicons name="md-checkmark-circle" size={32} color="#646699" />
                            </View>
                        </Pressable>

                    </View>
                </SafeAreaView>
            </Modal>
            <View style={styles.header}>
                <Text style={styles.headerText}>Your Space</Text>
            </View>
            <View style={styles.body}>
                <Pressable onPress={() => setModal(true)}>
                    <Image style={styles.writeLogo} source={require('../images/write.png')} />
                </Pressable>
                <FlatList data={sheets} renderItem={(item) => renderSheetPreview(item)} keyExtractor={(item) => item.id} />
            </View>
            <Footer route={route} navigation={navigation} />
        </SafeAreaView>
    )
}

