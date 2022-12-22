import { Text, View, TextInput, Pressable, Image, KeyboardAvoidingView, Alert } from 'react-native';
import styles from './../styles/Stylesheet';
import { supabase } from '../env/supabase';
import 'react-native-url-polyfill/auto';
import * as React from 'react';

export default function SignIn({ route, navigation }) {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

    const [user, setUser] = React.useState(null);


    const userFound = (user) => {
        if (user && user !== null && user.user && user.session) return true;
        return false;
    };

    React.useEffect(() => {
        async function getSession() {
            const { data, error } = await supabase.auth.getSession();
            if (data && data.session) {
                setUser(data.session);
            }
        }
        getSession();
    }, []);

    React.useEffect(() => {
        const insertUser = async () => {
            let emailLower = email.toLowerCase();
            const tryFindUser = await supabase.from('users').select('*').eq('email', emailLower);
            if (tryFindUser.data.length === 0) {
                const { data, error } = await supabase.from('users').insert({
                    email: emailLower,
                });
                if (error) {
                    console.log("issue with inserting user", error);
                }
                navigation.navigate("Setup", { email: emailLower, firstTime: true });
            } else if (tryFindUser.data[0].display_name === null || tryFindUser.data[0].username === null) {
                navigation.navigate("Setup", { email: emailLower, firstTime: true });
            } else {
                navigation.navigate('HomePage', { email: emailLower, firstTime: false });
            }
            // otherwise, do not insert into database again 
        }

        if (userFound(user)) insertUser();
    }, [user]);


    const getUser = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        setUser(data);
        if (error && error.message === "Invalid login credentials") {
            Alert.alert('An account with this username and password combination was not found. Please try again.');
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ backgroundColor: '#BBB7EB', height: '100%' }}>
            <View style={styles.signUpHeaderPart}>
                <Text style={styles.signInHeader}>Cadenza</Text>
                <Image style={{ width: '90%', height: '90%' }} source={require('../images/logo.png')} />
            </View>
            <View style={{ flex: 1, margin: 20 }}>
                <TextInput style={styles.signInField} selectionColor={'#646699'} onChangeText={setEmail} value={email} placeholder='email' autoCapitalize={false} autoCorrect={false} />
                <TextInput style={styles.signInField} selectionColor={'#646699'} secureTextEntry={true} onChangeText={setPassword} value={password} placeholder='password' autoCapitalize={false} autoCorrect={false} />
                <Pressable onPress={getUser}>
                    <Text style={styles.signUpText}>Log In</Text>
                </Pressable>
                <Pressable onPress={() => navigation.navigate('SignUp')}>
                    <Text style={styles.signUpText}>No account? Sign up now.</Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    )
}