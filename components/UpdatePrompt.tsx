import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';
import { checkUpdate, ReleaseInfo, openUpdateLink } from '../utils/updateChecker';
import { useTheme } from '../utils/ThemeContext';
import { Download, X } from 'lucide-react-native';
import CustomModal from './CustomModal';

const UpdatePrompt = () => {
    const [release, setRelease] = useState<ReleaseInfo | null>(null);
    const [visible, setVisible] = useState(false);
    const { colors } = useTheme();

    useEffect(() => {
        const initCheck = async () => {
            const update = await checkUpdate();
            if (update && update.isNewer) {
                setRelease(update);
                setVisible(true);
            }
        };
        initCheck();
    }, []);

    if (!release || !visible) return null;

    return (
        <CustomModal
            visible={visible}
            onClose={() => setVisible(false)}
            title="New Update Available"
            buttons={[
                {
                    text: "Update Now",
                    onPress: () => {
                        openUpdateLink(release.url);
                        setVisible(false);
                    }
                }
            ]}
        >
            <Text style={[styles.version, { color: colors.success }]}>
                Version {release.version} is now available!
            </Text>

            {release.notes && (
                <View style={styles.notesContainer}>
                    <Text style={[styles.notesLabel, { color: colors.textPrimary }]}>What's New:</Text>
                    <Text
                        style={[styles.notes, { color: colors.textSecondary }]}
                        numberOfLines={6}
                    >
                        {release.notes}
                    </Text>
                </View>
            )}
        </CustomModal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    container: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    closeButton: {
        padding: 4,
    },
    version: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 16,
    },
    notesContainer: {
        marginBottom: 24,
    },
    notesLabel: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    notes: {
        fontSize: 14,
        lineHeight: 20,
    },
    updateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
    },
    updateButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
});

export default UpdatePrompt;
