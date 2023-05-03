import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { contactEmail } from "../config/Config";
import { vh, vw } from "../config/Toolbox";

const PrivacyModal = (props) => {
    const H1 = (props) => <Text style={styles.h1}>{props.children}</Text>
    const H2 = (props) => <Text style={styles.h2}>{props.children}</Text>
    const P = (props) => <Text style={styles.p}>{props.children}</Text>
    const UL = (props) => <View style={styles.ul}>{props.children}</View>
    const LI = (props) => <View style={styles.li}><Text style={styles.p}>    • {props.children}</Text></View>
    const A = (props) => <Text style={styles.a} onPress={() => Linking.openURL(props.href)}>{props.children}</Text>;

    const generateUL = (...texts) => {
        const entries = texts.map((text, i) => <LI key={i}><P>{text}</P></LI>);
        return ( <UL>{entries}</UL> );
    };

    return (
        <Modal
            transparent={true}
            onRequestClose={props.confirm}
            visible={props.isModalVisible}
        >
            <Pressable style={styles.absolute} onPress={props.confirm} />

            <ScrollView style={styles.body} overScrollMode="never" showsVerticalScrollIndicator={false}>
                <View style={styles.textContainer}>
                    <H1>Privacy Policy</H1>

                    <H2>Privacy Policy</H2>
                    <P>Travis Heavener built the BinGo app as an Open Source app. This SERVICE is provided by Travis Heavener at no cost and is intended for use as is.</P>
                    <P>This page is used to inform visitors regarding my policies with the collection, use, and disclosure of Personal Information if anyone decided to use my Service.</P>
                    <P>If you choose to use my Service, then you agree to the collection and use of information in relation to this policy. The Personal Information that I collect is used for providing and improving the Service. I will not use or share your information with anyone except as described in this Privacy Policy.</P>
                    <P>The terms used in this Privacy Policy have the same meanings as in our Terms and Conditions, which are accessible at BinGo unless otherwise defined in this Privacy Policy.</P>

                    <H2>Information Collection and Use</H2>
                    <P>For a better experience, while using our Service, I may require you to provide us with certain personally identifiable information. The information that I request will be retained on your device and is not collected by me in any way.</P>
                    <P>The app does use third-party services that may collect information used to identify you.</P>
                    <P>Link to the privacy policy of third-party service providers used by the app</P>
                    { generateUL(
                        <A href="https://www.google.com/policies/privacy/">Google Play Services</A>,
                        <A href="https://expo.io/privacy">Expo</A>
                    ) }

                    <H2>Log Data</H2>
                    <P>I want to inform you that whenever you use my Service, in a case of an error in the app I collect data and information (through third-party products) on your phone called Log Data. This Log Data may include information such as your device Internet Protocol (“IP”) address, device name, operating system version, the configuration of the app when utilizing my Service, the time and date of your use of the Service, and other statistics.</P>
                    
                    <H2>Cookies</H2>
                    <P>Cookies are files with a small amount of data that are commonly used as anonymous unique identifiers. These are sent to your browser from the websites that you visit and are stored on your device's internal memory.</P>
                    <P>This Service does not use these “cookies” explicitly. However, the app may use third-party code and libraries that use “cookies” to collect information and improve their services. You have the option to either accept or refuse these cookies and know when a cookie is being sent to your device. If you choose to refuse our cookies, you may not be able to use some portions of this Service.</P>

                    <H2>Service Providers</H2>
                    <P>I may employ third-party companies and individuals due to the following reasons:</P>
                    { generateUL(
                        "To facilitate our Service;", "To provide the Service on our behalf;",
                        "To perform Service-related services; or", "To assist us in analyzing how our Service is used."
                    ) }

                    <P>I want to inform users of this Service that these third parties have access to their Personal Information. The reason is to perform the tasks assigned to them on our behalf. However, they are obligated not to disclose or use the information for any other purpose.</P>

                    <H2>Security</H2>
                    <P>I value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and I cannot guarantee its absolute security.</P>

                    <H2>Links to Other Sites</H2>
                    <P>This Service may contain links to other sites. If you click on a third-party link, you will be directed to that site. Note that these external sites are not operated by me. Therefore, I strongly advise you to review the Privacy Policy of these websites. I have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.</P>

                    <H2>Children’s Privacy</H2>
                    <P>These Services do not address anyone under the age of 13. I do not knowingly collect personally identifiable information from children under 13 years of age. In the case I discover that a child under 13 has provided me with personal information, I immediately delete this from our servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact me so that I will be able to do the necessary actions.</P>

                    <H2>Changes to This Privacy Policy</H2>
                    <P>I may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any changes. I will notify you of any changes by posting the new Privacy Policy on this page.</P>
                    <P>This policy is effective as of 2023-05-03</P>

                    <H2>Contact Us</H2>
                    <P>If you have any questions or suggestions about my Privacy Policy, do not hesitate to contact me at {contactEmail}.</P>
                    <P>This privacy policy page was created at <A href="https://privacypolicytemplate.net/">privacypolicytemplate.net</A> and modified/generated by <A href="https://app-privacy-policy-generator.nisrulz.com/">App Privacy Policy Generator</A></P>

                    <Pressable style={styles.acceptButton} onPress={props.confirm}>
                        <Text style={styles.acceptButtonText}>Okay</Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* shows border over text */}
            <View style={styles.containerBorder} pointerEvents="none" />
        </Modal>
    )
};

export default PrivacyModal;

const styles = StyleSheet.create({
    absolute: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#0006"
    },
    body: {
        position: "absolute",
        left: vw(12.5),
        right: vw(12.5),
        top: vh(25),
        bottom: vh(25),
        paddingHorizontal: vw(4),
        backgroundColor: "#f0f0f0",
        borderRadius: vh(2.5)
    },
    textContainer: {
        width: "100%",
        marginVertical: vh(2),
        overflow: "hidden"
    },
    containerBorder: {
        position: "absolute",
        left: vw(12.5),
        right: vw(12.5),
        top: vh(25),
        bottom: vh(25),
        borderRadius: vh(2.5),
        borderWidth: vh(0.5),
        borderColor: "#c0c0c0"
    },
    h1: {
        marginVertical: vh(1),
        textAlign: "center",
        fontFamily: "Arial",
        fontWeight: "800",
        fontSize: vh(3),
        lineHeight: vh(4),
        color: "#000"
    },
    h2: {
        marginTop: vh(1),
        marginBottom: vh(0.5),
        textAlign: "left",
        fontFamily: "Arial",
        fontWeight: "800",
        fontSize: vh(2.25),
        lineHeight: vh(3.5),
        color: "#333"
    },
    h3: {
        marginTop: vh(1),
        marginBottom: vh(0.5),
        textAlign: "left",
        fontFamily: "Arial",
        fontWeight: "800",
        fontSize: vh(2),
        lineHeight: vh(3.25),
        color: "#444"
    },
    p: {
        textAlign: "left",
        fontFamily: "Arial",
        fontWeight: "400",
        fontSize: vh(1.625),
        lineHeight: vh(2.125),
        color: "#111"
    },
    a: {
        textAlign: "left",
        fontFamily: "Arial",
        fontWeight: "400",
        fontSize: vh(1.625),
        lineHeight: vh(2.125),
        textDecorationLine: "underline",
        color: "blue"
    },
    ul: {
        width: "100%",
        flexDirection: "column",
        marginTop: vh(1.625)
    },
    li: {
        marginVertical: vh(0.25)
    },
    acceptButton: {
        width: vw(26),
        height: vh(6),
        marginTop: vh(2),
        alignSelf: "center"
    },
    acceptButtonText: {
        flex: 1,
        textAlign: "center",
        textAlignVertical: "center",
        fontWeight: "600",
        fontSize: vh(2.625),
        backgroundColor: "#b0b0ff",
        borderWidth: vh(0.33),
        borderColor: "#222",
        borderRadius: vh(1.25)
    }
});