import React from 'react';
import { View, Pressable, TextInput } from 'react-native';
import { supabase } from '../env/supabase';
import 'react-native-url-polyfill/auto';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';


export function Lyricsheet({ route, navigation }) {
    const [text, setText] = React.useState(route.params.item.text);

    async function sendToDB() {
        const { data, error } = await supabase.from('sheets').update({ text: text }).eq('email', route.params.item.email).eq('title', route.params.item.title).select();
        if (error) {
            console.log('could not send updated sheet to DB: ', error);
        }
    }

    async function getSheets() {
        const { data, error } = await supabase.from('sheets').select('text').eq('email', route.params.item.email).eq('title', route.params.item.title);
        if (error) {
            console.log("could not get sheet: ", error);
        }
        setText(data[0].text);
    }

    let sub;
    const listenToChanges = async () => {
        sub = supabase.channel('sheets').on('postgres_changes', { event: '*', schema: '*' }, (payload) => {
            console.log("a change");
            getSheets();
        }).subscribe();
    };

    React.useEffect(() => {
        listenToChanges();
        return () => sub?.unsubscribe();
    }, []);

    const [recording, setRecording] = React.useState();

    // CODE CITATION: this code below is from https://docs.expo.dev/versions/v47.0.0/sdk/audio/
    async function startRecording() {
        try {
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            console.log('recording started');
        } catch (err) {
            console.error('could not start recording', err);
        }
    }

    const [curSound, setCurSound] = React.useState();

    // CODE CITATION: this code below is from https://stackoverflow.com/questions/60444307/save-blob-to-filesystem-in-react-native-expo
    async function downloadRecording(path) {
        const { data, error } = await supabase.storage.from('sounds').download(path);
        if (error) {
            console.log("could not download recording", error);
            return;
        }
        const fileReader = new FileReader();
        fileReader.readAsDataURL(data);
        fileReader.onload = async () => {
            let actualData = fileReader.result.split(',')[1];
            const fileUri = `${FileSystem.documentDirectory}/${path}`;
            await FileSystem.writeAsStringAsync(fileUri, actualData, { encoding: FileSystem.EncodingType.Base64 });
            setCurSound(fileUri);
        }
    }

    React.useEffect(() => {
        downloadRecording(route.params.item.soundUri);
    }, []);

    async function updateSoundUri(path) {
        const { data, error } = await supabase.from('sheets').update({ soundUri: path }).eq('email', route.params.item.email).eq('title', route.params.item.title).select();
        if (error) {
            console.log('could not send updated sheet to DB: ', error);
            return;
        }
        console.log("Sound uri has been updated");
    }

    // CODE CITATION: this code below is from https://docs.expo.dev/versions/v47.0.0/sdk/audio/
    async function stopRecording() {
        console.log('Stopping recording..');
        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
        });
        const uri = recording.getURI();
        setCurSound(uri);
        const fileExt = uri.split('.').pop();
        const filePath = `${Math.random()}.${fileExt}`;
        let content = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
        const { data, error } = await supabase.storage.from('sounds').upload(filePath,
            decode(content), { contentType: 'audio/mpeg' });

        updateSoundUri(filePath);

        console.log('Recording stopped and stored at', uri);
    }

    const [sound, setSound] = React.useState();

    // CODE CITATION: this code below is from https://docs.expo.dev/versions/v47.0.0/sdk/audio/
    async function playSound() {
        if (!curSound || curSound === "") {
            console.log('no sound');
            return;
        }
        const { sound } = await Audio.Sound.createAsync({ uri: curSound }
        );
        setSound(sound);

        console.log('playing sound ...');
        await sound.playAsync();
    }

    React.useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);



    return (
        <View style={{ padding: 10, backgroundColor: 'white', height: '100%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Pressable onPress={recording ? stopRecording : startRecording}>
                    <View style={{ padding: 5 }}>
                        {recording ? <Ionicons name="pause-circle-outline" size={24} color="maroon" />
                            : <MaterialCommunityIcons name="record-circle-outline" size={24} color="maroon" />}
                    </View>
                </Pressable>
                <Pressable onPress={playSound}>
                    <View style={{ padding: 5 }}>
                        <Ionicons name="play-circle-outline" size={24} color="green" />
                    </View>
                </Pressable>
            </View>
            <TextInput value={text} selectionColor={'#646699'} placeholder={'Start writing lyrics!'} onChangeText={setText} onEndEditing={async () => await sendToDB()} multiline={true} style={{ textAlign: 'center', color: '#646699' }}></TextInput>
        </View>
    )
}