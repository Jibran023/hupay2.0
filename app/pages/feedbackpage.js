import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

function FeedbackScreen({ navigation }) {
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');

    const handleBackButton = () => {
        navigation.goBack();
    };

    const handleRating = (rate) => {
        setRating(rate);
    };

    const handleSubmit = () => {
        // Handle feedback submission
        console.log('Feedback Submitted:', feedback);
    };

    const handleCancel = () => {
        setFeedback('');
        setRating(0);
    };

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity onPress={handleBackButton} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.subcontainer}>
                {/* Feedback Title */}
                <Text style={styles.feedbackTitle}>How would you rate your experience?</Text>

                {/* Rating Stars */}
                <View style={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map((rate) => (
                        <TouchableOpacity key={rate} onPress={() => handleRating(rate)}>
                            <MaterialIcons
                                name={rate <= rating ? 'star' : 'star-border'}
                                size={30}
                                color="#77074e"
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Feedback Text Area */}
                <TextInput
                    style={styles.textArea}
                    multiline
                    numberOfLines={4}
                    placeholder="Type your feedback here"
                    value={feedback}
                    onChangeText={setFeedback}
                />

                {/* Feedback Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f1f6', // Background color of the screen
        padding: 10,
        borderWidth: 8, // Border around the screen
        borderColor: '#77074e', // Border color for the screen
    },
    subcontainer:{
        borderWidth: 4, // Border around the card box
        borderColor: '#77074e', // Border color for the card box
        padding: 25,
        top: 60,
    },
    backButton: {
        position: 'absolute',
        top: 10,
        left: 20,
        backgroundColor: '#77074e', // Dark purple for back button
        padding: 10,
        borderRadius: 30,
    },
    feedbackTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#77074e',
        textAlign: 'center',
        marginVertical: 10,
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 0,
        
    },
    textArea: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginVertical: 20,
        fontSize: 16,
        color: '#555',
    },
    complaintsLink: {
        color: '#00BFFF', // Light blue color for complaints link
        textAlign: 'center',
        marginVertical: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    cancelButton: {
        backgroundColor: '#555', // Dark gray for cancel button
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        width: '45%',
    },
    submitButton: {
        backgroundColor: '#77074e', // Yellow for submit button
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        width: '45%',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default FeedbackScreen;
