import Onboarding from 'react-native-onboarding-swiper';
import { Image } from 'react-native';


// CODE CITATION: adapted from https://github.com/jfilter/react-native-onboarding-swiper
export default function OnboardScreen({route, navigation}) {
    return <Onboarding
    titleStyles={{color: 'white'}}
    subTitleStyles={{color: '#646699'}}
    onDone={() => navigation.navigate('SignIn')} 
    showSkip={false}
    imageContainerStyles={{paddingBottom: 10}}
    pages={[
      {
        backgroundColor: '#BBB7EB',
        title: 'cadenza: your musical space',
        subtitle: 'Welcome to Cadenza!',
        image: <Image style={{resizeMode: 'contain', width: '90%', marginBottom: 0}} source={require('../images/logo.png')}/>
      }, 
      {
        backgroundColor: '#BBB7EB',
        title: "A place for all things music",
        subtitle: "Share your musical creations, connect with other musicians, and create your own musical space.",
        image: <Image style={{resizeMode: 'contain', width: '90%', marginBottom: 0}} source={require('../images/onboarding2.png')}/>
      },
      {
        backgroundColor: '#BBB7EB',
        title: "Let's get started!",
        subtitle: "Join other musicians in their melodic journeys.",
        image: <Image style={{resizeMode: 'contain', width: '90%', marginBottom: 0}} source={require('../images/onboarding3.png')}/>
      }
    ]}
  />
}
