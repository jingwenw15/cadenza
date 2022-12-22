import { StyleSheet, Dimensions } from 'react-native';
import colors from './colors';

const { height, width } = Dimensions.get('screen');

export default styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        flex: 1,
        marginTop: 15,
    },
    headerText: {
        fontSize: 30,
        color: colors.darkPurple,
    },
    chatBody: {
        flex: 1,
    },
    body: {
        flex: 20,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: height * 0.7,
        marginTop: 10
    },
    bodyText: {
        color: colors.darkPurple,
        width: width * 0.70,
    },
    footer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        width: '100%',
        marginBottom: 15
    },
    footerText: {
        color: colors.darkPurple,
    },
    logo: {
        height: height * 0.06,
        aspectRatio: '1/1',
        resizeMode: 'contain',
    },
    profilePic: {
        resizeMode: 'contain',
        width: width * 0.1,
        aspectRatio: 1 / 1,
        marginRight: 10
    },
    post: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        width: width * 0.9,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: colors.offWhite,
        padding: 10,
        marginTop: 10,
        backgroundColor: colors.offWhite,
    },
    userMetadata: {
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    messagePreview: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        width: width * 0.9,
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: colors.offWhite,
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: colors.offWhite
    },
    searchPage: {
        backgroundColor: colors.lightPurple,
        height: height
    },
    searchBody: {
        flex: 20,
        marginTop: 20,
        alignItems: 'center',
    },
    profileBody: {
        flex: 20,
        margin: 20,
    },
    signInField: {
        borderRadius: 5,
        marginTop: 10,
        marginBottom: 10,
        padding: 7,
        backgroundColor: colors.offWhite,
        color: colors.darkPurple
    },
    signInHeader: {
        fontSize: 30,
        color: colors.darkPurple,
        marginTop: 40
    },
    signUpText: {
        margin: 10,
        textAlign: 'center',
        marginTop: 20,
        color: colors.darkPurple,
        fontSize: 20
    },
    signUpHeaderPart: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 2,
        marginTop: 15
    },
    feedHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        marginTop: 15
    },
    postInput: {
        width: width * 0.8,
        height: height * 0.3,
        paddingTop: 15,
        paddingLeft: 10,
        paddingRight: 10,
        color: colors.darkPurple
    },
    writeLogo: {
        height: height * 0.04,
        aspectRatio: '1/1',
        resizeMode: 'contain',
        marginBottom: 15
    },
    sheetPreview: {
        backgroundColor: colors.offWhite,
        padding: 5,
        margin: 5,
        width: width * 0.8,
        borderRadius: 5,
    },
    searchIndivUser: {
        marginTop: 15, 
        flexDirection: 'row', 
        backgroundColor: colors.offWhite, 
        width: width * 0.8,
        height: height * 0.05,
        padding: 5,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
