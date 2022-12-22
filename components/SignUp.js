import { Text, SafeAreaView, View, TextInput, Pressable, Image, Modal, KeyboardAvoidingView, Alert } from 'react-native';
import styles from './../styles/Stylesheet';
import { supabase } from '../env/supabase';
import * as React from 'react';

export default function SignUp({ route, navigation }) {
    const [user, setUser] = React.useState(null);
    const [modalOn, setModal] = React.useState(false);

    React.useEffect(() => {
        signUpUser();
    }, []);

    const userFound = (user) => {
        if (user && user.user && user.user.aud === "authenticated") return true;
        return false;
    };

    React.useEffect(() => {
        if (userFound(user) && user !== null) {
            setModal(true);
        } else if (user === "EXISTS") {
            navigation.navigate('SignIn');
        }
    }, [user]);


    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

    const signUpUser = async () => {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });
        if (error) {
            if (error.message === "User already registered") {
                setUser('EXISTS');
                Alert.alert('Error: An account with this email already exists. Please sign in now.');
            } else if (error.message === "Password should be at least 6 characters") {
                Alert.alert('Error: Password should be at least 6 characters long.');
            } else if (error.message === "Unable to validate email address: invalid format") {
                Alert.alert('Error: Please enter a valid email address.');
            }
        }
        setUser(data);
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ backgroundColor: '#BBB7EB', height: '100%' }}>
            <Modal animationType={'slide'} visible={modalOn}>
                <SafeAreaView style={{ backgroundColor: '#BBB7EB', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ backgroundColor: 'white', marginLeft: 30, marginRight: 30, borderRadius: 20 }}>
                        <Text style={{ color: '#646699', textAlign: 'center', margin: 30, }}>Thank you for signing up for Cadenza.</Text>
                        <Text style={{ color: '#646699', textAlign: 'center', marginBottom: 30, marginLeft: 20, marginRight: 20 }}>Please log in to continue.</Text>
                        <Pressable onPress={() => {
                            setModal(false);
                            navigation.navigate('SignIn', { firstTime: true });
                        }}>
                            <Text style={{ color: 'gray', textAlign: 'center', marginBottom: 30 }}>OK!</Text>
                        </Pressable>
                    </View>
                </SafeAreaView>
            </Modal>
            <View style={styles.signUpHeaderPart}>
                <Text style={styles.signInHeader}>Cadenza</Text>
                <Image style={{ width: '90%', height: '90%' }} source={require('../images/logo.png')} />
            </View>
            <View style={{ flex: 1, margin: 20 }}>
                <TextInput style={styles.signInField} selectionColor={'#646699'} onChangeText={setEmail} value={email} placeholder='email' autoCapitalize={false} autoCorrect={false} />
                <TextInput style={styles.signInField} selectionColor={'#646699'} secureTextEntry={true} onChangeText={setPassword} value={password} placeholder='password' autoCapitalize={false} autoCorrect={false} />
                <Pressable onPress={signUpUser}>
                    <Text style={styles.signUpText}>Sign Up</Text>
                </Pressable>
                <Pressable onPress={() => navigation.navigate('SignIn')}>
                    <Text style={styles.signUpText}>Already have an account? Log in.</Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}