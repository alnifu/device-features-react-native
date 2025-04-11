import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Switch,
    Platform,
    StatusBar,
} from 'react-native';
import { getEntries, deleteEntry } from '../utils/storage';
import { TravelEntry } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen() {
    const { darkMode, toggleDarkMode } = useTheme();
    const [entries, setEntries] = useState<TravelEntry[]>([]);
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadEntries();
        });
        return unsubscribe;
    }, [navigation]);

    const loadEntries = async () => {
        const data = await getEntries();
        setEntries(data.reverse());
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await deleteEntry(id);
                    loadEntries();
                },
            },
        ]);
    };

    const toggleLike = (id: string) => {
        setEntries(prev =>
            prev.map(entry =>
                entry.id === id ? { ...entry, liked: !entry.liked } : entry
            )
        );
    };

    const renderItem = ({ item }: { item: TravelEntry }) => (

        <View style={styles.entryContainer}>
            <Image
                source={{ uri: item.imageUri }}
                style={styles.image}
            />
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => toggleLike(item.id)}>
                    <Ionicons
                        name={item.liked ? 'heart' : 'heart-outline'}
                        size={24}
                        color={item.liked ? 'red' : darkMode ? 'white' : 'gray'}
                    />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Ionicons name="share-social" size={24} color={darkMode ? 'white' : 'gray'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}
                >
                    <Ionicons name="trash-outline" size={24} color={darkMode ? 'white' : 'gray'} />
                </TouchableOpacity>
            </View>
            <Text style={[styles.locationText, { color: darkMode ? 'white' : 'black', paddingBottom: 10 }]}>{item.location || 'Location not available'}</Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: darkMode ? 'black' : 'white' }]}>
            <View
                style={[
                    styles.topBar,
                    {
                        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 60,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingHorizontal: 20,
                    },
                ]}
            >
                <Text
                    style={{
                        color: darkMode ? 'white' : 'black',
                        fontSize: 18,
                        fontWeight: '600',
                    }}
                >
                    Travel Diary
                </Text>

                <TouchableOpacity onPress={toggleDarkMode}>
                    <Ionicons
                        name={darkMode ? 'sunny-outline' : 'moon-outline'}
                        size={26}
                        color={darkMode ? 'white' : 'black'}
                    />
                </TouchableOpacity>
            </View>


            {entries.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: darkMode ? 'white' : 'black' }]}>
                        No Entries yet...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={entries}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 80 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 20,
        backgroundColor: 'transparent',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
    },
    entryContainer: {
        marginBottom: 10,
        position: 'relative',
    },
    image: {
        width: '100%', 
        height: 500,
        resizeMode: 'cover',
    },
    deleteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 6,
        backgroundColor: 'transparent',
    },
    actions: {
        flexDirection: 'row',
        padding: 10,
        justifyContent: 'flex-start',
        gap: 20,
        paddingBottom: 5,
    },
    locationText: {
        paddingHorizontal: 10,
        fontSize: 14,
    },
});
