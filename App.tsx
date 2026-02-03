import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Alert,
    StatusBar,
    PermissionsAndroid,
    Platform,
    Animated,
} from 'react-native';
import RNFS from 'react-native-fs';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

interface Download {
    id: string;
    url: string;
    filename: string;
    progress: number;
    status: 'downloading' | 'completed' | 'failed' | 'paused';
    filePath?: string;
    fileSize?: number;
    downloadedSize?: number;
}

const App = () => {
    const [url, setUrl] = useState('');
    const [downloads, setDownloads] = useState<Download[]>([]);
    const [activeDownloads, setActiveDownloads] = useState<{ [key: string]: any }>({});

    useEffect(() => {
        requestStoragePermission();
    }, []);

    const requestStoragePermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                ]);

                if (
                    granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
                    granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
                ) {
                    console.log('Storage permissions granted');
                } else {
                    Alert.alert('Permission Denied', 'Storage permission is required to download files');
                }
            } catch (err) {
                console.warn(err);
            }
        }
    };

    const pasteFromClipboard = async () => {
        const clipboardContent = await Clipboard.getString();
        if (clipboardContent) {
            setUrl(clipboardContent);
        }
    };

    const getFilenameFromUrl = (url: string): string => {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
            return filename || `download_${Date.now()}`;
        } catch {
            return `download_${Date.now()}`;
        }
    };

    const startDownload = async () => {
        if (!url.trim()) {
            Alert.alert('Error', 'Please enter a valid URL');
            return;
        }

        const filename = getFilenameFromUrl(url);
        const downloadId = Date.now().toString();
        const downloadPath = `${RNFS.DownloadDirectoryPath}/${filename}`;

        const newDownload: Download = {
            id: downloadId,
            url: url,
            filename: filename,
            progress: 0,
            status: 'downloading',
            filePath: downloadPath,
        };

        setDownloads(prev => [newDownload, ...prev]);

        try {
            const downloadOptions = {
                fromUrl: url,
                toFile: downloadPath,
                background: true,
                discretionary: true,
                progress: (res: any) => {
                    const progress = (res.bytesWritten / res.contentLength) * 100;
                    setDownloads(prev =>
                        prev.map(d =>
                            d.id === downloadId
                                ? {
                                    ...d,
                                    progress: progress,
                                    fileSize: res.contentLength,
                                    downloadedSize: res.bytesWritten,
                                }
                                : d
                        )
                    );
                },
            };

            const download = RNFS.downloadFile(downloadOptions);
            setActiveDownloads(prev => ({ ...prev, [downloadId]: download }));

            const result = await download.promise;

            if (result.statusCode === 200) {
                setDownloads(prev =>
                    prev.map(d =>
                        d.id === downloadId ? { ...d, status: 'completed', progress: 100 } : d
                    )
                );
                Alert.alert('Success', `${filename} downloaded successfully!`);
            } else {
                throw new Error('Download failed');
            }
        } catch (error) {
            setDownloads(prev =>
                prev.map(d =>
                    d.id === downloadId ? { ...d, status: 'failed' } : d
                )
            );
            Alert.alert('Error', 'Failed to download file');
        }

        setUrl('');
    };

    const deleteDownload = async (download: Download) => {
        Alert.alert(
            'Delete File',
            `Are you sure you want to delete ${download.filename}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        if (download.filePath && download.status === 'completed') {
                            try {
                                await RNFS.unlink(download.filePath);
                            } catch (error) {
                                console.log('Error deleting file:', error);
                            }
                        }
                        setDownloads(prev => prev.filter(d => d.id !== download.id));
                    },
                },
            ]
        );
    };

    const formatBytes = (bytes?: number): string => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const renderDownloadItem = ({ item }: { item: Download }) => {
        const getStatusColor = () => {
            switch (item.status) {
                case 'completed':
                    return '#10b981';
                case 'downloading':
                    return '#3b82f6';
                case 'failed':
                    return '#ef4444';
                default:
                    return '#6b7280';
            }
        };

        const getStatusIcon = () => {
            switch (item.status) {
                case 'completed':
                    return 'check-circle';
                case 'downloading':
                    return 'downloading';
                case 'failed':
                    return 'error';
                default:
                    return 'pause-circle';
            }
        };

        return (
            <View style={styles.downloadItem}>
                <View style={styles.downloadHeader}>
                    <Icon name={getStatusIcon()} size={24} color={getStatusColor()} />
                    <View style={styles.downloadInfo}>
                        <Text style={styles.filename} numberOfLines={1}>
                            {item.filename}
                        </Text>
                        <Text style={styles.downloadSize}>
                            {item.downloadedSize && item.fileSize
                                ? `${formatBytes(item.downloadedSize)} / ${formatBytes(item.fileSize)}`
                                : item.status === 'completed' && item.fileSize
                                    ? formatBytes(item.fileSize)
                                    : 'Calculating...'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => deleteDownload(item)}
                        style={styles.deleteButton}>
                        <Icon name="delete" size={24} color="#ef4444" />
                    </TouchableOpacity>
                </View>
                {item.status === 'downloading' && (
                    <View style={styles.progressBarContainer}>
                        <View
                            style={[
                                styles.progressBar,
                                { width: `${item.progress}%`, backgroundColor: getStatusColor() },
                            ]}
                        />
                    </View>
                )}
                {item.status === 'downloading' && (
                    <Text style={styles.progressText}>{Math.round(item.progress)}%</Text>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1f2937" />
            <LinearGradient
                colors={['#1f2937', '#111827']}
                style={styles.header}>
                <View style={styles.headerContent}>
                    <Icon name="cloud-download" size={32} color="#60a5fa" />
                    <Text style={styles.headerTitle}>File Downloader</Text>
                </View>
            </LinearGradient>

            <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                    <Icon name="link" size={24} color="#6b7280" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Paste download link here..."
                        placeholderTextColor="#9ca3af"
                        value={url}
                        onChangeText={setUrl}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity onPress={pasteFromClipboard} style={styles.pasteButton}>
                        <Icon name="content-paste" size={24} color="#60a5fa" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.downloadButton, !url.trim() && styles.downloadButtonDisabled]}
                    onPress={startDownload}
                    disabled={!url.trim()}>
                    <LinearGradient
                        colors={url.trim() ? ['#3b82f6', '#2563eb'] : ['#4b5563', '#374151']}
                        style={styles.downloadButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}>
                        <Icon name="download" size={24} color="#ffffff" />
                        <Text style={styles.downloadButtonText}>Download</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <View style={styles.downloadsSection}>
                <View style={styles.downloadsSectionHeader}>
                    <Icon name="folder" size={24} color="#60a5fa" />
                    <Text style={styles.downloadsSectionTitle}>Downloads</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{downloads.length}</Text>
                    </View>
                </View>

                {downloads.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Icon name="cloud-download" size={80} color="#374151" />
                        <Text style={styles.emptyStateTitle}>No Downloads Yet</Text>
                        <Text style={styles.emptyStateText}>
                            Paste a link above and tap Download to get started
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={downloads}
                        renderItem={renderDownloadItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.downloadsList}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    header: {
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        letterSpacing: 0.5,
    },
    inputContainer: {
        padding: 20,
        gap: 16,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 2,
        borderColor: '#334155',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: '#ffffff',
        fontSize: 16,
        paddingVertical: 16,
    },
    pasteButton: {
        padding: 8,
    },
    downloadButton: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    downloadButtonDisabled: {
        shadowOpacity: 0,
    },
    downloadButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 12,
    },
    downloadButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    downloadsSection: {
        flex: 1,
        backgroundColor: '#1e293b',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 20,
        padding: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    downloadsSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    downloadsSectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        flex: 1,
    },
    badge: {
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginTop: 24,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#9ca3af',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    downloadsList: {
        gap: 12,
    },
    downloadItem: {
        backgroundColor: '#0f172a',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    downloadHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    downloadInfo: {
        flex: 1,
    },
    filename: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 4,
    },
    downloadSize: {
        fontSize: 14,
        color: '#9ca3af',
    },
    deleteButton: {
        padding: 8,
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: '#334155',
        borderRadius: 3,
        marginTop: 12,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: '#60a5fa',
        marginTop: 6,
        textAlign: 'right',
        fontWeight: '600',
    },
});

export default App;
