import { View } from 'react-native';
import styles from '../styles/Stylesheet';
import React, { useState, useCallback, useEffect } from 'react';
import { Bubble, Send, GiftedChat } from 'react-native-gifted-chat';
import { supabase } from '../env/supabase';


export default function RenderChatbox({ navigation, route }) {
    
    return (
        <ChatBox otherUser={route.params.item.userId} curUser={route.params.item.curUser} />
    )
}

// CITATION: this code below is adapted from https://github.com/FaridSafi/react-native-gifted-chat#example
function ChatBox({ curUser, otherUser }) {
    const [messages, setMessages] = useState([]);
    const [avatarUrl, setAvatarUrl] = useState('');

    let sub;
    const listenToChanges = async () => {
        sub = supabase.channel('messages').on('postgres_changes', { event: '*', schema: '*' }, (payload) => {
            console.log("a change of message: ");
            downloadImage();
        });
    };

    async function downloadImage() {
        try {
            const otherUserData = await supabase.from('users').select('avatar').eq('email', otherUser);
            const path = otherUserData.data[0].avatar;
            const { data, error } = await supabase.storage.from('avatars').download(path);
            if (error) {
                getMessages(null);
                return;
            }
            const fileReader = new FileReader();
            fileReader.readAsDataURL(data);
            
            fileReader.onload = () => {
                if (fileReader.result !== avatarUrl) setAvatarUrl(fileReader.result); // maybe this usestate is useless
                getMessages(fileReader.result);
            }
            return fileReader;
        } catch (error) {
            console.log("could not download image: ", error.message);
        }
    }

    React.useEffect(() => {
        downloadImage();
    }, []);
    

    async function getMessages(result) {
        const toCurUser = await supabase.from('messages').select('*').eq('recipient', curUser).eq('sender', otherUser);
        const fromCurUser = await supabase.from('messages').select('*').eq('recipient', otherUser).eq('sender', curUser);
        if (toCurUser.error || fromCurUser.error) {
            console.log('could not get messages: ', toCurUser.error, fromCurUser.error);
            return;
        }
        const chatterData = await supabase.from('users').select('display_name, avatar, username, email').eq('email', otherUser);
        const curUserData = await supabase.from('users').select('display_name, avatar, username, email').eq('email', curUser);
        if (chatterData.error || curUserData.error) {
            console.log('could not get users data: ', chatterData.error, curUserData.error);
            return;
        }
        const allData = toCurUser.data.concat(fromCurUser.data);

        let newMsgs = [];
        for (let msg of allData) {
            const sender = (chatterData.data[0].email === msg.sender) ? chatterData.data[0] : curUserData.data[0];
            let user = {};
            user._id = sender.email;
            user.name = sender.display_name;
            user.avatar = require('../images/profile.png'); 
            if (sender.avatar && sender.avatar !== "" && curUser !== sender.email) {
                user.avatar = result;
            }
            delete msg.sender;
            delete msg.recipient;
            msg.user = user;
            newMsgs.push(msg);
        }
        setMessages(newMsgs);
    }

    React.useEffect(() => {
        listenToChanges();
        // return () => sub?.unsubscribe(); 
    }, []);

    useEffect(() => {
        downloadImage();
    }, [avatarUrl]);

    const onSend = useCallback(async (messages = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
        let msg = {}; 
        msg.sender = curUser;
        msg.recipient = otherUser;
        msg.text = messages[0].text;
        const { data, error } = await supabase.from('messages').insert(msg);
        if (error) {
            console.log('could not add message to database: ', error);
        }
    }, []);


    return (
        <View style={{ flex: 1, backgroundColor: 'white', marginBottom: 0 }}>
            <GiftedChat
                renderBubble={(props) => <Bubble {...props} wrapperStyle={{ right: { backgroundColor: '#646699' } }} />}
                renderSend={(props) => <Send {...props} textStyle={{ color: '#646699' }} />}            
                messages={messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
                onSend={messages => onSend(messages)}
                user={{
                    _id: curUser,
                }}
            />
        </View>
    )
}