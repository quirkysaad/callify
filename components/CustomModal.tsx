import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../utils/ThemeContext';
import { X } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';

interface ModalButton {
    text: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
}

interface CustomModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    buttons?: ModalButton[];
    children?: React.ReactNode;
    animate?: boolean;
}

const CustomModal = ({ visible, onClose, title, description, buttons, children, animate = true }: CustomModalProps) => {
    const { colors, isDark } = useTheme();

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
                    <Animated.View
                        entering={animate ? FadeIn.duration(200) : undefined}
                        exiting={animate ? FadeOut.duration(200) : undefined}
                        style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
                    />
                </Pressable>

                <Animated.View
                    entering={animate ? ZoomIn.springify().damping(20).stiffness(150) : undefined}
                    exiting={animate ? ZoomOut.duration(150) : undefined}
                    style={[styles.container, { backgroundColor: colors.card }]}
                >
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {description && (
                        <Text style={[styles.description, { color: colors.textSecondary }]}>
                            {description}
                        </Text>
                    )}

                    {children}

                    {buttons && buttons.length > 0 && (
                        <View style={styles.buttonContainer}>
                            {buttons.map((btn, index) => {
                                const isPrimary = btn.variant === 'primary' || !btn.variant;
                                const isDanger = btn.variant === 'danger';

                                let bgColor = colors.primaryLight;
                                let textColor = colors.primary;

                                if (isPrimary) {
                                    bgColor = colors.primary;
                                    textColor = colors.background;
                                } else if (isDanger) {
                                    bgColor = colors.danger;
                                    textColor = colors.white;
                                }

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        activeOpacity={0.7}
                                        style={[
                                            styles.button,
                                            { backgroundColor: bgColor },
                                            index > 0 && { marginTop: 10 }
                                        ]}
                                        onPress={btn.onPress}
                                    >
                                        <Text style={[styles.buttonText, { color: textColor }]}>
                                            {btn.text}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 28,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    closeButton: {
        padding: 4,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 20,
    },
    buttonContainer: {
        marginTop: 10,
    },
    button: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
    },
});

export default CustomModal;
